import { useTranslation } from 'react-i18next';

function Home() {
    const { t } = useTranslation();

    return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial', color: '#333' }}>
            <h2>{t('welcome_message')}</h2>
            <p>{t('select_option_from_menu')}</p>
        </div>
    );
}

export default Home;
