<?php
// Prevent direct file access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="usbfdbadmin">
    <h1 class="wp-heading-inline">
        <span>Real-Time Feedback</span>
        <a class="usbfdbadmin-link" href="<?php menu_page_url('realTimeFeedback')?>&poll-options">Edit Poll Settings</a>
    </h1>

    <?php
        if (count($insights)) {
    ?>
        <table class="usbfdbadmin-table">
            <thead>
                <th width="1%"></th>
                <th width="20%">Type</th>
                <th width="30%">URL Page</th>
                <th width="30%">HTML Element</th>
                <th width="9%"></th>
            </thead>
            <tbody>
                <?php
                    $types = array(
                        "rage"=> "Rage Clicks",
                        "frustration"=> "Frustration",
                        "wastedClick"=> "Wasted Clicks",
                    );

                    foreach ($insights as $key => $value) {
                ?>
                        <tr>
                            <td><?php echo $key + 1; ?></td>
                            <td>
                                <div class="insight-type">
                                    <span>
                                        <?php
                                            echo $types[$value->type];
                                        ?>
                                    </span>
                                    <div class="usbfdbadmin-tooltip">
                                        <div class="usbfdbadmin-tooltip-info">
                                            <?php
                                                if ($value->type === 'rage') {
                                                    echo 'Detect multiple clicks or taps, rapidly, in the same area. Find when your website doesn\'t react the way your users thought it should.';
                                                } elseif ($value->type === 'frustration') {
                                                    echo 'Detect behaviors where users encounter indicators like chaotic mouse movement, random clicks or multiple up and down page scrolls.';
                                                } elseif ($value->type === 'wastedClick') {
                                                    echo 'Detect misleading links that force users to bounce back and forth between a routing page and subpages linked from it.';
                                                }
                                            ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="insight-type-analytics">
                                    <?php
                                        if ($value->total) {
                                            echo $value->total . ' behaviors';

                                            if ($value->last3Days) {
                                                echo ' (' . $value->last3Days . ' in the last 3 days)';
                                            }
                                        } else {
                                            echo 'no behaviors available';
                                        }
                                    ?>
                                </div>
                            </td>
                            <td>
                                <a href="<?php echo $value->page; ?>" target="_blank"><?php echo $value->page; ?></a>
                            </td>
                            <td>
                                <div style="display: flex;">
                                    <?php
                                        if ($value->target) {
                                            $trg = explode('|', $value->target, 2);
                                    ?>
                                            <div>
                                                <div><?php echo $trg[0]; ?></div>

                                                <?php
                                                    if (isset($trg[1])) {
                                                        echo "<div>$trg[1]</div>";
                                                    }
                                                ?>
                                            </div>
                                            <div class="usbfdbadmin-tooltip">
                                                <div class="usbfdbadmin-tooltip-info">
                                                    This selector points to the HTML Element on the page <strong><?php echo $value->page; ?></strong> <br>
                                                    You can <a href="https://www.youtube.com/watch?v=B1pZElyWa78" target="_blank">watch this video</a> on how to find a HTML Element via a Selector in a web page.
                                                </div>
                                            </div>
                                    <?php
                                        } else {
                                            echo 'n/a';
                                        }
                                    ?>
                                </div>
                            </td>
                            <td>
                                <a href="<?php menu_page_url('realTimeFeedback')?>&id=<?php echo $value->id; ?>" class="usbfdbadmin-button">VIEW REPORT</a>
                            </td>
                        </tr>
                <?php
                    }
                ?>
            </tbody>
        </table>
    <?php
        } else {
            echo '<p>Real-Time Feedback is now collecting data from your website. <br>';
            echo 'Here you\'ll see what issues you have in your funnel. </p>';
        }
    ?>
</div>
