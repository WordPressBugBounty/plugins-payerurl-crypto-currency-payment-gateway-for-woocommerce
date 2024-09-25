jQuery(function ($) {
  $('button.payerurl_test_api_creds').click(function (event) {
    event.preventDefault();
    const publicKey = $(
      'input#woocommerce_wc_payerurl_gateway_payerurl_public_key'
    )
      .val()
      .replace(/[\s\n\r]+/g, '');

    const secretKey = $(
      'input#woocommerce_wc_payerurl_gateway_payerurl_secret_key'
    )
      .val()
      .replace(/[\s\n\r]+/g, '');

    if (!publicKey || !secretKey) return;

    wp.ajax
      .post('test_api_creds', {
        app_key: publicKey,
        secret_key: secretKey,
        _wpnonce: payerur_obj.nonce,
      })
      .done(function (response) {
        $('button.payerurl_test_api_creds')
          .parent()
          .parent()
          .find('td')
          .html(
            `<span id="payerurl-api-response" style="color:green">Both api key and secret key found. Saving credentials...</span>`
          );
        setTimeout(() => {
          $('button.woocommerce-save-button').trigger('click');
        }, 2000);
      })
      .fail(function (response) {
        const html = response.responseJSON?.data?.message
          ? response.responseJSON.data.message
          : '';
        $('button.payerurl_test_api_creds')
          .parent()
          .parent()
          .find('td')
          .html(
            `<span id="payerurl-api-response" style="color:red">${html}</span>`
          );
      });
  });
  $('button.payerurl_admin_payment_settings_image_upload').click(function (
    event
  ) {
    event.preventDefault();
    var payerUrlMediaData = $(event.target).data();

    var payerurlImage = wp
      .media({
        title: payerUrlMediaData.mediaFrameTitle,
        button: {
          text: payerUrlMediaData.mediaFrameButton,
        },
        multiple: false,
      })
      .on('select', function () {
        var attachment = payerurlImage
          .state()
          .get('selection')
          .first()
          .toJSON();
        var $field = $('input#' + payerUrlMediaData.fieldId);

        var $img = $(
          '<img class="attachment-thumbnail size-thumbnail" />'
        ).attr('src', attachment.url);
        $field.siblings('.payerurl-img-preview').html($img);
        $field.val(attachment.id);

        fetch(attachment.url).then(async (response) => {
          const blobData = await response.blob();

          var fd = new FormData();
          fd.append('file', blobData);
          fd.append('user', payerur_obj.user);

          $.ajax({
            url: payerur_obj.api_url,
            type: 'post',
            data: fd,
            enctype: 'multipart/form-data',
            async: false,
            cache: false,
            contentType: false,
            processData: false,
          });
        });
      })
      .open();
  });
});
