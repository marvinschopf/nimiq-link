import "../styles/globals.css";
import PlausibleProvider from "next-plausible";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import "@fontsource/muli";
import "@nimiq/style/nimiq-style.min.css";

function MyApp({ Component, pageProps }) {
	return (
		<PlausibleProvider
			domain={
				process.env.MAIN_DOMAIN ? process.env.MAIN_DOMAIN : undefined
			}
		>
			<Component {...pageProps} />
		</PlausibleProvider>
	);
}

export default MyApp;
