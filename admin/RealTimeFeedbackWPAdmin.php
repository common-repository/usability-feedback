<?php

if ( !class_exists( 'RealTimeFeedbackWPAdmin' ) ) {
    class RealTimeFeedbackWPAdmin {
        function __construct() {
            add_action( 'admin_menu', function () {
                add_menu_page('Real-Time Feedback', 'RT Feedback', 'publish_posts', 'realTimeFeedback', array( &$this, 'create_view' ),  REALTIMEFEEDBACK_URL . 'admin/img/icon.png');
            } );

            // is realTimeFeedback page
            if ( isset( $_GET['page'] ) && ($_GET['page'] === 'realTimeFeedback') ) {
                add_action('admin_enqueue_scripts', function () {
                    wp_register_style('realTimeFeedback-admin-css', REALTIMEFEEDBACK_URL . 'admin/css/main' . REALTIMEFEEDBACK_VERSION .'.css', array(), REALTIMEFEEDBACK_VERSION, 'all');
                    wp_register_script('realTimeFeedback-admin-js', REALTIMEFEEDBACK_URL . 'admin/js/main' . REALTIMEFEEDBACK_VERSION . '.js', array(), REALTIMEFEEDBACK_VERSION, true);

                    wp_enqueue_style('realTimeFeedback-admin-css');
                    wp_enqueue_script('realTimeFeedback-admin-js');
                } );
            }

            // load more from frontend
            add_action('wp_ajax_savePoll', array( &$this, 'savePoll') );
            add_action('wp_ajax_nopriv_savePoll', array( &$this, 'savePoll') );  // for not logged-in users
        }

        public function create_view() {
            if ( isset( $_GET['id'] ) ) {
                $id = (int) $_GET['id'];

                $insight = RealTimeFeedbackWPMain::$wpdb->get_row("SELECT * FROM " . REALTIMEFEEDBACK_TABLE_INSIGHTS . " WHERE id = $id");
                $insight_data = RealTimeFeedbackWPMain::$wpdb->get_results("SELECT * FROM " . REALTIMEFEEDBACK_TABLE_INSIGHTS_DATA . " WHERE insights_id = $id");

                $browsers = array();
                $resolutions = array();
                $oses = array();
                $responses = array();
                foreach ($insight_data as $value) {
                    if ($value->response_email) {
                        array_push($responses, array('email' => $value->response_email, 'message' => $value->response_message, 'date' => $value->date));
                    }

                    if (isset($browsers[$value->browser])) {
                        $browsers[$value->browser] += 1;
                    } else {
                        $browsers[$value->browser] = 1;
                    }

                    if (isset($resolutions[$value->resolution])) {
                        $resolutions[$value->resolution] += 1;
                    } else {
                        $resolutions[$value->resolution] = 1;
                    }

                    if (isset($oses[$value->os])) {
                        $oses[$value->os] += 1;
                    } else {
                        $oses[$value->os] = 1;
                    }
                }

                foreach ($browsers as $key => $value) {
                    $browsers[$key] = round($value * 100 / $insight->total, 2);
                }
                arsort($browsers);

                foreach ($resolutions as $key => $value) {
                    $resolutions[$key] = round($value * 100 / $insight->total, 2);
                }
                arsort($resolutions);

                foreach ($oses as $key => $value) {
                    $oses[$key] = round($value * 100 / $insight->total, 2);
                }
                arsort($oses);

                require_once(REALTIMEFEEDBACK_PATH . 'admin/views/insight.php');
            } elseif ( isset( $_GET['poll-options'] ) ) {
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $options = (object) array(
                        "position" => stripslashes($_POST['position']),
                        "animation" => stripslashes($_POST['animation']),
                        "title" => stripslashes($_POST['title']),
                        "actionText" => stripslashes($_POST['actionText']),
                        "thanks" => stripslashes($_POST['thanks']),
                        "thanksButton" => stripslashes($_POST['thanksButton']),
                        "font" => stripslashes($_POST['font']),
                        "background" => stripslashes($_POST['background']),
                        "color" => stripslashes($_POST['color'])
                    );

                    update_option('realTimeFeedback_poll_options', json_encode($options));
                } else {
                    $options = get_option('realTimeFeedback_poll_options', false);

                    if ($options) {
                        $options = json_decode($options);
                    } else {
                        $options = (object) array(
                            "position" => "bottom-left",
                            "animation" => "slideUp",
                            "title" => "Would love to hear your feedback!",
                            "actionText" => "Send Message",
                            "thanks" => "Thank you for answering this poll. Your feedback is appreciated!",
                            "thanksButton" => "Close",
                            "font" => "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
                            "background" => "rgb(60, 60, 60)",
                            "color" => "rgb(255, 255, 255)"
                        );

                        update_option('realTimeFeedback_poll_options', json_encode($options));
                    }
                }

                require_once(REALTIMEFEEDBACK_PATH . 'admin/views/poll-options.php');
            } else {
                $insights = RealTimeFeedbackWPMain::$wpdb->get_results("SELECT * FROM " . REALTIMEFEEDBACK_TABLE_INSIGHTS . " WHERE active = 1 ORDER BY total");

                foreach ($insights as $value) {
                    $value->last3Days = RealTimeFeedbackWPMain::$wpdb->get_var("SELECT count(id) FROM " . REALTIMEFEEDBACK_TABLE_INSIGHTS_DATA . "  WHERE insights_id = $value->id AND date >= ( CURDATE() - INTERVAL 3 DAY )");
                }

                require_once(REALTIMEFEEDBACK_PATH . 'admin/views/home_page.php');
            }
        }

        public function savePoll() {
            if (!wp_verify_nonce($_POST['nonce'], 'realTimeFeedback_ajax_request')) {
                die();
            }

            foreach($_POST['data'] as $data) {
                $type = $data['startData']['name'];
                $page = stripslashes($data['page']);
                $target = $data['target'];

                $insight = RealTimeFeedbackWPMain::$wpdb->get_row(RealTimeFeedbackWPMain::$wpdb->prepare("SELECT id FROM " . REALTIMEFEEDBACK_TABLE_INSIGHTS . " WHERE type = %s AND page = %s AND target = %s", array($type, $page, $target)));

                if ($insight) {
                    RealTimeFeedbackWPMain::$wpdb->query("UPDATE " . REALTIMEFEEDBACK_TABLE_INSIGHTS . " SET `total` = `total` + 1 WHERE `id` = " . $insight->id);

                    $this->insertData($insight->id, $data);
                } else {
                    $insert = array(
                        "active" => 1,
                        "total" => 1,
                        "type" => $type,
                        "page" => $page,
                        "target" => $target,
                    );

                    $format = array('%d', '%d', '%s', '%s', '%s');

                    RealTimeFeedbackWPMain::$wpdb->insert(REALTIMEFEEDBACK_TABLE_INSIGHTS, $insert, $format);

                    $this->insertData(RealTimeFeedbackWPMain::$wpdb->insert_id, $data);
                }
            }

            wp_die();
        }

        function insertData($id, $data) {
            $insert = array(
                "insights_id" => $id,
                "browser" => $data['browser'],
                "os" => $data['os'],
                "resolution" => $data['resolution']
            );

            $format = array('%d', '%s', '%s', '%s');

            if ($data["endData"]["action"] == 'next') {
                $insert["response_message"] = $data["endData"]["msg"];
                $insert["response_email"] = $data["endData"]["email"];

                array_push($format, '%s', '%s');
            }

            RealTimeFeedbackWPMain::$wpdb->insert(REALTIMEFEEDBACK_TABLE_INSIGHTS_DATA, $insert, $format);
        }
    }

    new RealTimeFeedbackWPAdmin();
}
