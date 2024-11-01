<?php
// Prevent direct file access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="usbfdbadmin">
    <h1 class="wp-heading-inline">
        <?php
            $types = array(
                "rage"=> "Rage Clicks",
                "frustration"=> "Frustration",
                "wastedClick"=> "Wasted Clicks",
            );
            echo $types[$insight->type];
        ?> (<?php echo $insight->total; ?> behaviors)</h1>

    <?php
        if ($insight->total) { ?>
            <div class="usbfdbadmin-tabstats" data-js-tabstats>
                <div class="usbfdbadmin-tabstats-header" data-js-header>
                    <div class="usbfdbadmin-tabstats-title" data-active data-js>Browser</div>
                    <div class="usbfdbadmin-tabstats-title" data-js>Screen Resolution</div>
                    <div class="usbfdbadmin-tabstats-title" data-js>OS Type</div>
                </div>
                <div class="usbfdbadmin-tabstats-body">
                    <div class="usbfdbadmin-tabstats-body-item" data-active data-js-body>
                        <?php
                            $i = 0;
                            foreach ($browsers as $key => $value) {
                                echo '<div class="usbfdbadmin-tabstats-row' . ($i % 2 == 0? ' usbfdbadmin-tabstats-row--stripe': '') .'">';
                                echo '<div class="usbfdbadmin-tabstats-index">' . ($i + 1) . '. </div>';
                                echo '<div class="usbfdbadmin-tabstats-content">' . $key . '</div>';
                                echo '<div class="usbfdbadmin-tabstats-value">' . $value . '%</div>';
                                echo "</div>";
                                $i++;
                            }

                            if ($i === 0) {
                                echo '<div class="usbfdbadmin-tabstats-row"><div class="usbfdbadmin-tabstats-content">No Data to display</div></div>';
                            }
                        ?>
                    </div>
                    <div class="usbfdbadmin-tabstats-body-item" data-js-body>
                        <?php
                            $i = 0;
                            foreach ($resolutions as $key => $value) {
                                echo '<div class="usbfdbadmin-tabstats-row' . ($i % 2 == 0? ' usbfdbadmin-tabstats-row--stripe': '') .'">';
                                echo '<div class="usbfdbadmin-tabstats-index">' . ($i + 1) . '. </div>';
                                echo '<div class="usbfdbadmin-tabstats-content">' . $key . '</div>';
                                echo '<div class="usbfdbadmin-tabstats-value">' . $value . '%</div>';
                                echo "</div>";
                                $i++;
                            }

                            if ($i === 0) {
                                echo '<div class="usbfdbadmin-tabstats-row"><div class="usbfdbadmin-tabstats-content">No Data to display</div></div>';
                            }
                        ?>
                    </div>
                    <div class="usbfdbadmin-tabstats-body-item" data-js-body>
                        <?php
                            $i = 0;
                            foreach ($oses as $key => $value) {
                                echo '<div class="usbfdbadmin-tabstats-row' . ($i % 2 == 0? ' usbfdbadmin-tabstats-row--stripe': '') .'">';
                                echo '<div class="usbfdbadmin-tabstats-index">' . ($i + 1) . '. </div>';
                                echo '<div class="usbfdbadmin-tabstats-content">' . $key . '</div>';
                                echo '<div class="usbfdbadmin-tabstats-value">' . $value . '%</div>';
                                echo "</div>";
                                $i++;
                            }

                            if ($i === 0) {
                                echo '<div class="usbfdbadmin-tabstats-row"><div class="usbfdbadmin-tabstats-content">No Data to display</div></div>';
                            }
                        ?>
                    </div>
                </div>
            </div>

            <table class="usbfdbadmin-table">
                <thead>
                    <th width="1%"></th>
                    <th width="25%">Email</th>
                    <th width="64%">Message</th>
                    <th width="10%">Date</th>
                </thead>
                <tbody>
                    <?php
                        foreach ($responses as $key => $value) {
                            echo "<tr>";
                            echo "<td>" . ($key + 1) . "</td>";
                            echo "<td>{$value['email']}</td>";
                            echo "<td>{$value['message']}</td>";
                            echo "<td>{$value['date']}</td>";
                            echo "</tr>";
                        }
                    ?>

                    <?php
                        if (count($responses) === 0) {
                            echo "<tr><td colspan='4'>No responses available for now</td></tr>";
                        }
                     ?>
                </tbody>
            </table>
    <?php } else {
        echo 'There are not enough data to show for this report.';
    } ?>
</div>
