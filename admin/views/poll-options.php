<?php
// Prevent direct file access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="usbfdbadmin">
    <h1 class="wp-heading-inline">Poll Options</h1>

    <div class="usbfdbadmin-preview-container">
        <form action="<?php menu_page_url('realTimeFeedback')?>&poll-options" method="post" accept-charset="utf-8" class="usbfdbadmin-form">
            <p>
                Interact with your users by showing a poll.
            </p>
            <div class="usbfdbadmin-form-section">
                <label for="position">Position</label>
                <select id="position" class="usbfdbadmin-form-select" name="position" data-js-realTimeFeedback-option="position">
                    <option value="bottom-left" <?php if ($options->position === 'bottom-left') { echo 'selected'; } ?>>Bottom Left</option>
                    <option value="bottom-right" <?php if ($options->position === 'bottom-right') { echo 'selected'; } ?>>Bottom Right</option>
                </select>
            </div>
            <div class="usbfdbadmin-form-section">
                <label for="animation">Animation</label>
                <select id="animation" class="usbfdbadmin-form-select" name="animation" data-js-realTimeFeedback-option="animation">
                    <option value="slideUp" <?php if ($options->animation === 'slideUp') { echo 'selected'; } ?>>Slide Up</option>
                    <option value="fadeIn" <?php if ($options->animation === 'fadeIn') { echo 'selected'; } ?>>Fade In</option>
                </select>
            </div>
            <div class="usbfdbadmin-form-section">
                <label for="title">Title</label>
                <input type="text" id="title" name="title" value="<?php echo $options->title; ?>" class="usbfdbadmin-form-input" data-js-realTimeFeedback-option="title">
            </div>
            <div class="usbfdbadmin-form-section">
                <label for="actionText">Action Text</label>
                <input type="text" id="actionText" name="actionText" value="<?php echo $options->actionText; ?>" class="usbfdbadmin-form-input" data-js-realTimeFeedback-option="actionText">
            </div>
            <div class="usbfdbadmin-form-section">
                <label for="thanks">Thank you Message</label>
                <input type="text" id="thanks" name="thanks" value="<?php echo $options->thanks; ?>" class="usbfdbadmin-form-input" data-js-realTimeFeedback-option="thanks">
            </div>
            <div class="usbfdbadmin-form-section">
                <label for="thanksButton">Thank you Button</label>
                <input type="text" id="thanksButton" name="thanksButton" value="<?php echo $options->thanksButton; ?>" class="usbfdbadmin-form-input" data-js-realTimeFeedback-option="thanksButton">
            </div>
            <div class="usbfdbadmin-form-section">
                <label for="font">Font Family</label>
                <input type="text" id="font" name="font" value="<?php echo $options->font; ?>" class="usbfdbadmin-form-input" data-js-realTimeFeedback-font>
            </div>
            <div class="usbfdbadmin-form-section">
                <label for="background">Background Color</label>
                    <input type="text" id="background" name="background" value="<?php echo $options->background; ?>" data-js-realTimeFeedback-spectrum="background">
            </div>
            <div class="usbfdbadmin-form-section">
                <label for="color">Text Color</label>
                    <input type="text" id="color" name="color" value="<?php echo $options->color; ?>" data-js-realTimeFeedback-spectrum="color">
            </div>

            <div class="usbfdbadmin-form-save">
                <button type="submit" class="usbfdbadmin-button" disabled data-js-saveButton>Save changes</button>
                <div class="usbfdbadmin-form-saveMessage">Please save your changes</div>
            </div>
        </form>
        <div class="usbfdbadmin-preview">
            <h2>Preview</h2>
            <div class="usbfdbadmin-preview-wrap" data-js-realTimeFeedback-preview></div>
        </div>
    </div>
</div>
