const retroTheme = {
    colors: {
        background: '#cee3f8',
        contentBackground: '#ffffff',
        border: '#5f99cf',
        borderLight: '#cce',
        headerBg: '#cee3f8',
        sectionHeaderBg: '#f0f0f0',
        text: '#222222',
        textLight: '#666666',
        link: '#336699',
        error: 'red',
        success: 'green',
        warning: '#b35900',
        buttonBg: '#f8f8f8',
        buttonBorder: '#ccc',
    },
    fonts: {
        main: 'Verdana, Arial, Helvetica, sans-serif',
        size: {
            small: '10px',
            normal: '12px',
            large: '14px',
            title: '16px',
        }
    },
    layout: {
        maxWidth: '1000px',
        padding: '10px',
        gap: '10px',
    },
    common: {
        pageContainer: {
            backgroundColor: '#cee3f8',
            minHeight: '100vh',
            fontFamily: 'Verdana, Arial, Helvetica, sans-serif',
            fontSize: '12px',
            color: '#222',
        },
        card: {
            backgroundColor: '#fff',
            border: '1px solid #5f99cf',
            borderRadius: '3px',
            padding: '10px',
            marginBottom: '10px',
        },
        header: {
            backgroundColor: '#cee3f8',
            borderBottom: '1px solid #5f99cf',
            padding: '5px 10px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        input: {
            padding: '5px',
            border: '1px solid #ccc',
            fontSize: '12px',
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: '10px',
        },
        button: {
            padding: '5px 10px',
            backgroundColor: '#f8f8f8',
            border: '1px solid #ccc',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#333',
            textTransform: 'uppercase',
        },
        link: {
            color: '#336699',
            textDecoration: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
        }
    }
};

export default retroTheme;
