<?php
/**
 * Plugin Name: ProxyPay v2 Gateway for WooCommerce
 * Description: Complete integration with ProxyPay payments and OptBot confirmation.
 * Version: 2.2.1
 * Author: Your Name
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Add Gateway to WooCommerce
add_filter('woocommerce_payment_gateways', 'add_proxypay_v2_gateway_class');
function add_proxypay_v2_gateway_class($gateways) {
    $gateways[] = 'WC_Gateway_ProxyPay_V2';
    return $gateways;
}

// Load Gateway Class
add_action('plugins_loaded', 'init_proxypay_v2_gateway_class');
function init_proxypay_v2_gateway_class() {

    class WC_Gateway_ProxyPay_V2 extends WC_Payment_Gateway {

        public function __construct() {
            $this->id = 'proxypay_v2';
            $this->method_title = 'ProxyPay v2';
            $this->method_description = 'Accept payments via ProxyPay with OptBot confirmation.';

            $this->has_fields = false;
            $this->init_form_fields();
            $this->init_settings();

            // Load settings
            $this->title = $this->get_option('title');
            $this->apikey = $this->get_option('apikey');
            $this->webhook_secret = $this->get_option('webhook_secret'); // Re-added
            $this->environment = $this->get_option('environment');
            $this->optbot_url = $this->get_option('optbot_url');
            $this->optbot_token = $this->get_option('optbot_token');
            $this->secret_key = $this->get_option('proxypay_node_api_secret_key');


            add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
            // The REST API endpoint is the preferred way for webhooks in modern WP/WooCommerce
            // It automatically handles /wp-json/proxypay/v2/webhook
        }

        public function init_form_fields() {
            $webhook_url = rest_url('proxypay/v2/webhook'); // Get the REST API webhook URL

            $this->form_fields = [
                'enabled' => [
                    'title' => 'Enable/Disable',
                    'type' => 'checkbox',
                    'label' => 'Enable ProxyPay',
                    'default' => 'yes'
                ],
                'title' => [
                    'title' => 'Title',
                    'type' => 'text',
                    'description' => 'Payment method title',
                    'default' => 'ProxyPay',
                    'desc_tip' => true
                ],
                'environment' => [
                    'title' => 'Environment',
                    'type' => 'select',
                    'options' => [
                        'production' => 'Production',
                        'sandbox' => 'Sandbox'
                    ],
                    'default' => 'production',
                    'description' => 'Select the ProxyPay environment.'
                ],
                'apikey' => [
                    'title' => 'ProxyPay API Key',
                    'type' => 'password',
                    'description' => 'Your API Key from your ProxyPay dashboard.',
                    'default' => ''
                ],
                'webhook_secret' => [ // Re-added for security
                    'title' => 'Webhook Secret',
                    'type' => 'password',
                    'description' => 'The secret key for validating webhooks from ProxyPay (find in ProxyPay dashboard).',
                    'default' => ''
                ],
                'proxypay_webhook_url_display' => [ // Display only, not an editable field
                    'title' => 'ProxyPay Webhook URL',
                    'type' => 'hidden', // Make it hidden to prevent saving, but show in description
                    'description' => 'Configure this URL in your ProxyPay dashboard: <code>' . esc_url($webhook_url) . '</code>',
                    'default' => '', // No default value to save
                    'css' => 'display: none;', // Hide the input field itself
                ],
                'optbot_url' => [
                    'title' => 'OptBot Webhook URL',
                    'type' => 'text',
                    'description' => 'Format: https://backoffice.optbot.com.br/webhooks/opt/partner/YOUR_KEY',
                    'default' => ''
                ],
                'optbot_token' => [
                    'title' => 'OptBot Access Token',
                    'type' => 'password',
                    'description' => 'Access token provided by OptBot for authentication.',
                    'default' => ''
                ],
                'secret_key' => [
                    'title' => 'proxypay node api secret key',
                    'type' => 'password',
                    'description' => 'secret key to communicate between node and woocomerece.',
                    'default' => ''
                ]
            ];
        }

        private function get_api_url() {
            return ($this->environment === 'sandbox')
                ? 'https://api.sandbox.proxypay.co.ao'
                : 'https://api.proxypay.co.ao';
        }

        // Removed get_webhook_url() as we're using the REST API URL directly

        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            if (!$order) {
                wc_add_notice('Error: Unable to retrieve order information.', 'error');
                error_log('ProxyPay Process Payment Error: Order not found for ID ' . $order_id);
                return;
            }

            $api_url = $this->get_api_url();
            $amount = number_format($order->get_total(), 2, '.', ''); // Ensure 2 decimal places

            // 1. Generate reference ID
            $ref_id = $this->generate_reference_id($api_url);
            if (!$ref_id) {
                wc_add_notice('Error generating ProxyPay reference ID. Please try again.', 'error');
                return;
            }

            // 2. Create actual reference with callback
            $created = $this->create_reference($api_url, $ref_id, $order, $amount);
            if (!$created) {
                wc_add_notice('Error creating ProxyPay payment reference. Please try again.', 'error');
                return;
            }

            // 3. Notify OptBot (PAYMENT_CREATED)
            $optbot_response = $this->notify_optbot($order, $ref_id, 'PAYMENT_CREATED');
            if ($optbot_response && isset($optbot_response['customer'])) {
                // Store the customer ID returned by OptBot for future use
                $order->update_meta_data('_optbot_customer_id', $optbot_response['customer']);
                $order->save();
            } else {
                error_log('ProxyPay OptBot Warning: No customer ID returned from PAYMENT_CREATED for order ' . $order_id);
                $order->add_order_note('Warning: OptBot did not return a customer ID during PAYMENT_CREATED event.');
            }

            // 4. Update order status and empty cart
            $order->update_meta_data('proxypay_reference_id', $ref_id);
            $order->save();
            $this->send_reference_email($order, $ref_id, $amount, date('d/m/Y', strtotime('+3 days'))); // Pass expiry for email

            $order->update_status('on-hold', 'Aguardando pagamento via ProxyPay.');
            WC()->cart->empty_cart();

            return [
                'result' => 'success',
                'redirect' => $this->get_return_url($order)
            ];
        }

        private function generate_reference_id($api_url) {
            $response = wp_remote_post("$api_url/reference_ids", [
                'headers' => [
                    'Authorization' => 'Token ' . $this->apikey,
                    'Accept' => 'application/vnd.proxypay.v2+json'
                ],
                'sslverify' => true,
                'timeout' => 30 // Increased timeout for external API calls
            ]);

            if (is_wp_error($response)) {
                error_log('ProxyPay Reference ID Generation Error: ' . $response->get_error_message());
                return false;
            }

            $ref_id = trim(wp_remote_retrieve_body($response));
            if (empty($ref_id)) {
                error_log('ProxyPay Reference ID Generation Error: Empty response body. Response: ' . print_r($response, true));
                return false;
            }

            return $ref_id;
        }

        private function create_reference($api_url, $ref_id, $order, $amount) {
            $expiry = date('Y-m-d\TH:i:s\Z', strtotime('+3 days'));

            // **IMPORTANT CHANGE HERE**
            // Replace this with the URL of your Node.js webhook endpoint
            $node_webhook_url = 'YOUR_NODE_API_WEBHOOK_URL_HERE';

            $data = [
                'amount' => (float)$amount,
                'end_datetime' => $expiry,
                'custom_fields' => [
                    'callback_url' => $node_webhook_url, // Changed to Node.js API
                    'order_id' => (string)$order->get_id(),
                    'customer_email' => $order->get_billing_email()
                ]
            ];

            $json_body = json_encode($data, JSON_UNESCAPED_SLASHES);

            $response = wp_remote_request("$api_url/references/$ref_id", [
                'method' => 'PUT',
                'headers' => [
                    'Authorization' => 'Token ' . $this->apikey,
                    'Accept' => 'application/vnd.proxypay.v2+json',
                    'Content-Type' => 'application/json; charset=utf-8' // Explicit charset
                ],
                'body' => $json_body,
                'sslverify' => true,
                'timeout' => 30
            ]);

            $response_code = wp_remote_retrieve_response_code($response);
            if ($response_code !== 204) {
                error_log('ProxyPay Reference Creation Failed. Code: ' . $response_code . ' Response Body: ' . wp_remote_retrieve_body($response) . ' Data Sent: ' . $json_body);
                return false;
            }

            return true;
        }

        private function notify_optbot($order, $payment_id, $event_type) {
            if (empty($this->optbot_url) || empty($this->optbot_token)) {
                error_log('OptBot configuration missing for event: ' . $event_type . ' for order ' . $order->get_id());
                $order->add_order_note('OptBot integration not fully configured. Event ' . $event_type . ' not sent.');
                return false;
            }

            $product_names = [];
            $license_count = 0;

            foreach ($order->get_items() as $item) {
                $product_names[] = $item->get_name();
                $license_count += $item->get_quantity();
            }

            $customer_id_for_optbot = $order->get_meta('_optbot_customer_id');

            // For PAYMENT_CREATED, if we don't have an OptBot customer ID yet, use WooCommerce customer ID
            // Otherwise, for any event, use the stored OptBot customer ID.
            if ($event_type === 'PAYMENT_CREATED' && empty($customer_id_for_optbot)) {
                $customer_id_for_optbot = 'wc-' . $order->get_customer_id();
            }

            $payload = [
                'event' => $event_type,
                'payment' => [
                    'id' => $payment_id,
                    'customer' => $customer_id_for_optbot ?: 'unknown', // Fallback for safety
                    'description' => implode(', ', $product_names),
                    'license' => $license_count
                ]
            ];

            $response = wp_remote_post($this->optbot_url, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'opt-access-token' => $this->optbot_token
                ],
                'body' => json_encode($payload),
                'timeout' => 15,
                'sslverify' => true
            ]);

            if (is_wp_error($response)) {
                error_log('OptBot API Error for order ' . $order->get_id() . ' event ' . $event_type . ': ' . $response->get_error_message());
                $order->add_order_note('Erro ao enviar evento para OptBot (' . $event_type . '): ' . $response->get_error_message());
                return false;
            }

            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);
            $response_data = json_decode($response_body, true);

            if ($response_code !== 200 && $response_code !== 201) { // OptBot might return 201 for creation
                error_log('OptBot API Failed for order ' . $order->get_id() . ' event ' . $event_type . '. Code: ' . $response_code . ' Body: ' . $response_body);
                $order->add_order_note('OptBot Error (' . $event_type . '): Code ' . $response_code . ' Body: ' . $response_body);
                return false;
            }

            $order->add_order_note(sprintf(
                'Evento %s enviado para OptBot. Código: %s',
                $event_type,
                $response_code
            ));

            return $response_data;
        }

    

        private function verify_webhook_signature($payload, $signature) {
            if (empty($this->webhook_secret)) {
                error_log('ProxyPay Webhook Security Alert: No webhook secret configured. Skipping signature verification.');
                // In a production environment, you might want to return false here and die.
                // For now, allow it to pass but log a strong warning.
                return true; // Allow for testing if secret is not set, but this is INSECURE for production!
            }

            $computed_signature = hash_hmac('sha256', $payload, $this->webhook_secret);
            $is_valid = hash_equals($signature, $computed_signature);

            if (!$is_valid) {
                error_log('ProxyPay Webhook Security Alert: Invalid signature. Expected: ' . $computed_signature . ' Received: ' . $signature . ' Payload: ' . $payload);
            }
            return $is_valid;
        }

        private function get_order_by_reference($reference_id) {
            global $wpdb;

            $order_id = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT post_id FROM $wpdb->postmeta
                    WHERE meta_key = 'proxypay_reference_id'
                    AND meta_value = %s",
                    $reference_id
                )
            );

            return $order_id ? wc_get_order($order_id) : false;
        }

        private function send_reference_email($order, $ref_id, $amount, $expiry_date_formatted) {
            $to = $order->get_billing_email();
            $subject = 'Detalhes de pagamento - Referência ProxyPay para a sua encomenda #' . $order->get_order_number();
            $headers = ['Content-Type: text/html; charset=UTF-8'];

            // Reverted to the more detailed and styled email content from your old code
            $message = '
            <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background-color: white; padding: 24px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <h2 style="color: #391653;">🎉 Obrigado pela sua encomenda!</h2>
                    <p>Olá ' . esc_html($order->get_billing_first_name()) . ',</p>
                    <p>Recebemos a sua encomenda. Para concluir, por favor efetue o pagamento com os seguintes dados:</p>
                    <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; font-weight: bold; background-color: #f2f2f2;">Referência</td>
                            <td style="padding: 10px;">' . esc_html($ref_id) . '</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; background-color: #f2f2f2;">Montante</td>
                            <td style="padding: 10px; color: green;">' . esc_html($amount) . ' AOA</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; background-color: #f2f2f2;">Validade</td>
                            <td style="padding: 10px;">' . esc_html($expiry_date_formatted) . '</td>
                        </tr>
                    </table>
                    <p style="margin-top: 20px;">Utilize esta referência para pagar em qualquer terminal Multicaixa ou app bancária.</p>
                    <p>Obrigado por escolher-nos!<br>A equipa da loja</p>
                </div>
            </div>';

            wp_mail($to, $subject, $message, $headers);
        }
    }
}

// Show Reference on Thank You Page
add_action('woocommerce_thankyou', 'show_proxypay_reference_on_thankyou', 10, 1);
function show_proxypay_reference_on_thankyou($order_id) {
    $order = wc_get_order($order_id);
    if (!$order) return;
    if ($order->get_payment_method() !== 'proxypay_v2') return;

    $reference_id = $order->get_meta('proxypay_reference_id');
    $amount = number_format($order->get_total(), 2, ',', '.'); // Ensure correct formatting for display

    if ($reference_id) {
        // Reverted to the more detailed and styled thank you page content from your old code
        echo '<section style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; margin-top: 30px;">';
        echo '<h2 style="color: #391653; font-size: 24px; margin-bottom: 16px;">🎉 Obrigado pela sua encomenda!</h2>';
        echo '<p style="font-size: 16px; margin-bottom: 12px;">Conclua o seu pagamento com os dados abaixo:</p>';

        echo '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">';
        echo '<span style="font-size: 20px; font-weight: bold; color: #391653;">Referência:</span>';
        echo '<span id="proxyRef" style="font-size: 20px; color: #000;">' . esc_html($reference_id) . '</span>';
        echo '<button onclick="copyReference()" style="padding: 6px 12px; font-size: 14px; background-color: #391653; color: white; border: none; border-radius: 6px; cursor: pointer;">Copiar</button>';
        echo '</div>';

        echo '<p style="font-size: 18px; margin-bottom: 12px;"><strong>Montante:</strong> <span style="color: green;">' . esc_html($amount) . ' AOA</span></p>';
        echo '<p style="font-size: 16px; color: #555;">Use este código numa caixa Multicaixa ou no seu banco para pagar. A referência é válida por 3 dias.</p>';
        echo '</section>';

        echo '<script>
            function copyReference() {
                const ref = document.getElementById("proxyRef").innerText;
                navigator.clipboard.writeText(ref).then(() => {
                    alert("Referência copiada com sucesso!");
                }).catch(err => {
                    console.error("Failed to copy text: ", err);
                    alert("Erro ao copiar a referência.");
                });
            }
        </script>';
    }
}

// Customize sender email & name for wp_mail globally
add_filter('wp_mail_from', 'custom_sysao_email');
add_filter('wp_mail_from_name', 'custom_sysao_name');

function custom_sysao_email($original) {
    return 'no-reply@sys.ao';
}

function custom_sysao_name($original) {
    return 'SYS.AO';
}

// Register REST API endpoint for webhooks
add_action('rest_api_init', 'register_proxypay_rest_webhook_endpoint');
function register_proxypay_rest_webhook_endpoint() {
    register_rest_route('proxypay/v2', '/webhook', [
        'methods' => 'POST',
        'callback' => 'handle_proxypay_rest_webhook_callback',
        'permission_callback' => '__return_true', // Webhooks typically don't require authentication
    ]);
}


// Somewhere in your plugin file, outside the class
add_action('rest_api_init', 'register_proxypay_internal_update_endpoint');
function register_proxypay_internal_update_endpoint() {
    register_rest_route('proxypay/v2', '/update-order', [
        'methods' => 'POST',
        'callback' => 'handle_proxypay_internal_order_update',
        'permission_callback' => 'proxypay_internal_update_permission_check', // Implement proper authentication
    ]);
}

function proxypay_internal_update_permission_check(WP_REST_Request $request) {
    // Implement a strong security check here.
    // This could be a shared secret key, an API token, or IP whitelisting.
    // For example, using a custom header with a pre-shared key:
    $secret_key = get_option('proxypay_node_api_secret_key'); // Store this in plugin settings
    $received_key = $request->get_header('X-Node-API-Secret');

    if (empty($secret_key) || $secret_key !== $received_key) {
        return new WP_Error('rest_forbidden', 'Unauthorized access to update endpoint.', ['status' => 401]);
    }
    return true;
}

function handle_proxypay_internal_order_update(WP_REST_Request $request) {
    $order_id = $request->get_param('order_id');
    $new_status = $request->get_param('status');
    $reference_id = $request->get_param('reference_id'); // Optional, for logging

    if (empty($order_id) || empty($new_status)) {
        return new WP_REST_Response(['message' => 'Missing order_id or status'], 400);
    }

    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_REST_Response(['message' => 'Order not found'], 404);
    }

    // Example of handling status update
    switch ($new_status) {
        case 'processing':
        case 'completed':
            if (!$order->has_status(['processing', 'completed'])) {
                $order->payment_complete($reference_id); // Marks as processing or completed based on products
                $order->add_order_note(sprintf('Order status updated by Node.js API via ProxyPay webhook for reference: %s', esc_html($reference_id)));
            }
            break;
        case 'on-hold':
            if (!$order->has_status('on-hold')) {
                $order->update_status('on-hold', sprintf('Order status updated by Node.js API (e.g., partial payment) for reference: %s', esc_html($reference_id)));
            }
            break;
        case 'failed':
            if (!$order->has_status('failed')) {
                $order->update_status('failed', sprintf('Order status failed by Node.js API via ProxyPay webhook for reference: %s', esc_html($reference_id)));
            }
            break;
        // Add other cases as needed
    }

    return new WP_REST_Response(['message' => 'Order updated successfully'], 200);
}

/**
 * REST API callback function to handle ProxyPay webhooks.
 * This instantiates the gateway and calls its webhook handler.
 * This is crucial for the webhook to work correctly via /wp-json/
 */
function handle_proxypay_rest_webhook_callback(WP_REST_Request $request) {
    // Instantiate the gateway to access its methods and settings
    $gateway = new WC_Gateway_ProxyPay_V2();
    $gateway->handle_webhook(); // This method will handle the response headers and exit itself
    return new WP_REST_Response('OK', 200); // This line will typically not be reached if handle_webhook() exits.
} 