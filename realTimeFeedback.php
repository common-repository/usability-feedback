<?php
/*
Plugin Name: Real-Time Feedback
Description: Real-Time Feedback - Collect feedback exactly when issues happen
Author:  Mihai Ionut
Author URI: http://getulmo.com/
Version: 1.0.0
Text Domain: realTimeFeedback
Domain Path: /lang
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/

if ( defined( 'ABSPATH' ) && !class_exists('RealTimeFeedbackWPMain') ) {
    global $wpdb;

    define( 'REALTIMEFEEDBACK_VERSION', '1.0.0' );
    define( 'REALTIMEFEEDBACK_TEXTDOMAIN', 'REALTIMEFEEDBACK' );
    define( 'REALTIMEFEEDBACK_DIRNAME', dirname( plugin_basename( __FILE__ ) ) );
    define( 'REALTIMEFEEDBACK_PATH', trailingslashit( dirname( __FILE__ ) ) );
    define( 'REALTIMEFEEDBACK_URL', trailingslashit( plugins_url( '', __FILE__ ) ) );
    define( 'REALTIMEFEEDBACK_TABLE_INSIGHTS', $wpdb->prefix . 'realTimeFeedback_insights' );
    define( 'REALTIMEFEEDBACK_TABLE_INSIGHTS_DATA', $wpdb->prefix . 'realTimeFeedback_insights_data' );

    class RealTimeFeedbackWPMain {
        // wordpress global db
        public static $wpdb;

        function __construct() {
            global $wpdb;

            // store global db instance
            self::$wpdb = $wpdb;

            add_action( 'init', array( &$this, 'init' ));
        }

        public function init() {
            if( is_admin() ) {
                register_uninstall_hook(__FILE__, array('RealTimeFeedbackWPMain', 'uninstall'));

                $this->check_db();

                // load the backend
                require_once( 'admin/RealTimeFeedbackWPAdmin.php' );

                // internationalization
                add_action('plugins_loaded', function () {
                    load_plugin_textdomain(REALTIMEFEEDBACK_TEXTDOMAIN, false, REALTIMEFEEDBACK_DIRNAME . '/languages/');
                });
            } else {
                // register and load scripts
                add_action('wp_enqueue_scripts', function () {
                    wp_register_script('realTimeFeedback-public-js', REALTIMEFEEDBACK_URL . 'public/js/main' . REALTIMEFEEDBACK_VERSION . '.js', array(), REALTIMEFEEDBACK_VERSION, true);
                    wp_enqueue_script('realTimeFeedback-public-js');
                }, 9999);

                // add the WordPress Ajax Library to the frontend.
                add_action( 'wp_head', function () {
                    $options = get_option('realTimeFeedback_poll_options', false);

                    echo '<script>if (typeof ajaxurl === "undefined") { var ajaxurl = "' . admin_url( 'admin-ajax.php' ) . '" }; ';
                    echo "window._realTimeFeedbackAjax = '" . wp_create_nonce( 'realTimeFeedback_ajax_request' ) . "';";
                    if ($options) {
                        echo "window._realTimeFeedback = window._realTimeFeedback || []; ";
                        echo "window._realTimeFeedback.push(['poll-data', $options]);";
                    }
                    echo "</script>";
                } );
            }
        }

        private function check_db() {
            $current_version = get_option('realTimeFeedback_version', false);

            if ($current_version !== REALTIMEFEEDBACK_VERSION) {
                $charset_collate = ( ( !empty(self::$wpdb->charset) )? ' DEFAULT CHARACTER SET ' . self::$wpdb->charset : '' ) .
                                   ( ( !empty(self::$wpdb->collate) )? ' COLLATE ' . self::$wpdb->collate : '');

                $sql = "CREATE TABLE IF NOT EXISTS " . REALTIMEFEEDBACK_TABLE_INSIGHTS . " (
                            id              INT(10)       UNSIGNED AUTO_INCREMENT NOT NULL,
                            active          TINYINT(1)    UNSIGNED NOT NULL DEFAULT 1,
                            total           INT(10)       UNSIGNED DEFAULT 0,
                            type            VARCHAR(255)  NOT NULL,
                            page            TEXT          NOT NULL,
                            target          TEXT,
                            PRIMARY KEY (id),
                            INDEX(active),
                            INDEX(total)
                        ){$charset_collate};";
                self::$wpdb->query($sql);

                $sql = "CREATE TABLE IF NOT EXISTS " . REALTIMEFEEDBACK_TABLE_INSIGHTS_DATA . " (
                            id                INT(10)       UNSIGNED AUTO_INCREMENT NOT NULL,
                            insights_id       INT(10)       UNSIGNED NOT NULL,
                            browser           TEXT,
                            os                TEXT,
                            resolution        TEXT,
                            response_email    TEXT,
                            response_message  TEXT,
                            date              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY(id),
                            INDEX(insights_id)
                        ){$charset_collate};";
                self::$wpdb->query($sql);

                update_option('realTimeFeedback_version', REALTIMEFEEDBACK_VERSION);
            }
        }

        public static function uninstall () {
            self::$wpdb->query('DROP TABLE IF EXISTS ' .  REALTIMEFEEDBACK_TABLE_INSIGHTS);
            self::$wpdb->query('DROP TABLE IF EXISTS ' .  REALTIMEFEEDBACK_TABLE_INSIGHTS_DATA);

            delete_option('realTimeFeedback_version');
            delete_option('realTimeFeedback_poll_options');
        }
    }

    new RealTimeFeedbackWPMain();
}
