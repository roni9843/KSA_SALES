import { create } from 'zustand';
import api from '../utils/api';

export const useCartStore = create((set, get) => ({
  cartItems: [],
  customer: null, // Holds selected customer object
  cartDiscount: 0,
  paidAmountCash: 0,
  paidAmountCard: 0,
  paidAmountBank: 0,

  addToCart: (product, quantity = 1) => {
    const { cartItems } = get();
    const existingIndex = cartItems.findIndex(item => item.product_id === product._id);

    if (existingIndex >= 0) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + quantity;
      
      // Prevent selling more than stock if not allowed (optional, let's let it run)
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].total_price = Number((newQty * updated[existingIndex].price - updated[existingIndex].discount).toFixed(2));
      set({ cartItems: updated });
    } else {
      const price = product.salePrice || 0;
      const taxRate = product.tax || 0;
      const taxAmount = Number(((price * taxRate) / 100).toFixed(2));
      
      const item = {
        product_id: product._id,
        name: product.name,
        price: price,
        tax: taxAmount,
        quantity: quantity,
        discount: 0,
        total_price: Number((quantity * price).toFixed(2))
      };
      set({ cartItems: [...cartItems, item] });
    }
  },

  removeFromCart: (productId) => {
    const { cartItems } = get();
    set({ cartItems: cartItems.filter(item => item.product_id !== productId) });
  },

  updateCartQuantity: (productId, quantity) => {
    const { cartItems } = get();
    const updated = cartItems.map(item => {
      if (item.product_id === productId) {
        const qty = Math.max(1, quantity);
        return {
          ...item,
          quantity: qty,
          total_price: Number((qty * item.price - item.discount).toFixed(2))
        };
      }
      return item;
    });
    set({ cartItems: updated });
  },

  updateCartItemDiscount: (productId, discount) => {
    const { cartItems } = get();
    const updated = cartItems.map(item => {
      if (item.product_id === productId) {
        const disc = Math.max(0, discount);
        return {
          ...item,
          discount: disc,
          total_price: Number((item.quantity * item.price - disc).toFixed(2))
        };
      }
      return item;
    });
    set({ cartItems: updated });
  },

  setCartDiscount: (discount) => {
    set({ cartDiscount: Math.max(0, discount) });
  },

  setCustomer: (customer) => {
    set({ customer });
  },

  setSplitPayment: (cash = 0, card = 0, bank = 0) => {
    set({
      paidAmountCash: Number(cash),
      paidAmountCard: Number(card),
      paidAmountBank: Number(bank)
    });
  },

  clearCart: () => {
    set({
      cartItems: [],
      customer: null,
      cartDiscount: 0,
      paidAmountCash: 0,
      paidAmountCard: 0,
      paidAmountBank: 0
    });
  },

  getCartTotals: () => {
    const { cartItems, cartDiscount } = get();
    
    let subTotal = 0;
    let itemDiscount = 0;
    let itemTax = 0;

    cartItems.forEach(item => {
      subTotal += item.price * item.quantity;
      itemDiscount += item.discount;
      itemTax += item.tax * item.quantity;
    });

    const payableTotal = Math.max(0, Number((subTotal + itemTax - itemDiscount - cartDiscount).toFixed(2)));

    return {
      subTotal: Number(subTotal.toFixed(2)),
      itemDiscount: Number(itemDiscount.toFixed(2)),
      itemTax: Number(itemTax.toFixed(2)),
      payableTotal
    };
  },

  checkout: async () => {
    const {
      cartItems, customer, cartDiscount,
      paidAmountCash, paidAmountCard, paidAmountBank,
      getCartTotals, clearCart
    } = get();

    if (cartItems.length === 0) {
      return { success: false, message: 'Cart is empty.' };
    }

    const { subTotal, itemDiscount, itemTax, payableTotal } = getCartTotals();
    const totalPaid = paidAmountCash + paidAmountCard + paidAmountBank;
    const dueAmount = Math.max(0, Number((payableTotal - totalPaid).toFixed(2)));
    const changeAmount = totalPaid > payableTotal ? Number((totalPaid - payableTotal).toFixed(2)) : 0;

    const payload = {
      customer_id: customer?._id || null, // Backend will default to walk-in if null
      sub_total: subTotal,
      item_discount: itemDiscount,
      item_tax: itemTax,
      cart_discount: cartDiscount,
      payable_total: payableTotal,
      paid_amount: totalPaid,
      paid_amount_cash: paidAmountCash,
      paid_amount_card: paidAmountCard,
      paid_amount_bank: paidAmountBank,
      due_amount: dueAmount,
      change_amount: changeAmount,
      invoice_items: cartItems
    };

    try {
      const response = await api.post('/invoices', payload);
      clearCart();
      return { success: true, invoiceId: response.data.invoiceId };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Checkout failed.'
      };
    }
  }
}));
