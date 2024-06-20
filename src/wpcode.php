<?php
register_activation_hook(__FILE__, function () {
    global $wpdb;
    $table_name = $wpdb->prefix . 'auth_tokens';
    $charset_collate = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE $table_name (
        id MEDIUMINT(9) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL,
        token VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
});
add_action('rest_api_init', function () {
    register_rest_route('custom-auth/v1', '/signup', ['methods' => 'POST', 'callback' => 'handle_user_signup']);
    register_rest_route('custom-auth/v1', '/login', ['methods' => 'POST', 'callback' => 'handle_user_login']);
    register_rest_route('custom-auth/v1', '/user', ['methods' => 'GET', 'callback' => 'get_user_info', 'permission_callback' => 'is_authenticated']);
});
function handle_user_signup($request) {
    global $wpdb;
    $username = sanitize_text_field($request['username']);
    $email = sanitize_email($request['email']);
    $password = wp_hash_password(sanitize_text_field($request['password']));
    $existing_user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}users WHERE user_login = %s OR user_email = %s", $username, $email));
    if ($existing_user) return new WP_Error('user_exists', 'Username or email already exists', ['status' => 409]);
    $wpdb->insert($wpdb->prefix . 'users', ['user_login' => $username, 'user_pass' => $password, 'user_email' => $email, 'user_registered' => current_time('mysql')]);
    return new WP_REST_Response('User created', 201);
}
function handle_user_login($request) {
    global $wpdb;
    $username = sanitize_text_field($request['username']);
    $password = sanitize_text_field($request['password']);
    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}users WHERE user_login = %s", $username));
    if (!$user || !wp_check_password($password, $user->user_pass)) return new WP_Error('invalid_credentials', 'Invalid credentials', ['status' => 403]);
    $token = bin2hex(random_bytes(32));
    $wpdb->insert($wpdb->prefix . 'auth_tokens', ['user_id' => $user->ID, 'token' => $token]);
    return new WP_REST_Response(['token' => $token], 200);
}
function get_user_info($request) {
    $user_id = $request->get_param('user_id');
    $user = get_userdata($user_id);
    return !$user ? new WP_Error('user_not_found', 'User not found', ['status' => 404]) : new WP_REST_Response(['username' => $user->user_login, 'email' => $user->user_email], 200);
}
function is_authenticated($request) {
    global $wpdb;
    $token = str_replace('Bearer ', '', $request->get_header('Authorization'));
    $token_row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}auth_tokens WHERE token = %s", $token));
    if (!$token_row) return false;
    $request->set_param('user_id', $token_row->user_id);
    return true;
}
?>
