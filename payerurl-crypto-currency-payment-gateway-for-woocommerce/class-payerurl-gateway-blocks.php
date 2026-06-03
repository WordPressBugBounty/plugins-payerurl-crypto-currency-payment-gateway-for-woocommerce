<?php

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

if (!class_exists('WC_Gateway_Payerurl_Blocks_Support')) {
    final class WC_Gateway_Payerurl_Blocks_Support extends AbstractPaymentMethodType
    {
        private $gateway;
        protected $name = PAYERURL_ID;

        public function initialize()
        {
            $this->settings = get_option('woocommerce_wc_payerurl_gateway_settings', array());
            $this->gateway  = new WC_Payerurl();
        }

        public function is_active()
        {
            return $this->gateway->is_available();
        }

        public function get_payment_method_script_handles()
        {
            $script_asset_path = PAYERURL_DIR . '/assets/build/payerurl.asset.php';
            $script_asset      = file_exists($script_asset_path)
                ? require $script_asset_path
                : array(
                    'dependencies' => array(),
                    'version'      => '1.2.0',
                );

            wp_register_script(
                'wc-payerurl-payments-blocks',
                PAYERURL_URL . 'assets/build/payerurl.js',
                $script_asset['dependencies'],
                $script_asset['version'],
                true
            );

            if (function_exists('wp_set_script_translations')) {
                wp_set_script_translations(
                    'wc-payerurl-payments-blocks',
                    'ABC-crypto-currency-payment-gateway-for-wooCommerce',
                    PAYERURL_DIR . '/languages/'
                );
            }

            return array('wc-payerurl-payments-blocks');
        }

        /**
         * FIX (CVE / Patchstack report):
         * Previously returned $this->settings which exposed payerurl_secret_key
         * and payerurl_public_key to the browser via window.wc.wcSettings.
         * Now returns only the display fields the frontend checkout UI needs.
         * Credentials never leave the server.
         */
        public function get_payment_method_data()
        {
            return [
                'title'       => $this->get_setting('title', 'Crypto Payment via PayerURL'),
                'description' => $this->get_setting('description', 'Pay securely with cryptocurrency.'),
                'supports'    => array_filter($this->gateway->supports, [$this->gateway, 'supports']),
            ];
        }

        /**
         * Helper to safely read a single setting without exposing the full array.
         */
        protected  function get_setting($key, $default = '')
        {
            return isset($this->settings[$key]) ? $this->settings[$key] : $default;
        }
    }
}
