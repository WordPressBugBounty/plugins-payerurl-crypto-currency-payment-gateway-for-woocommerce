jQuery(function ($) {
  $('button.payerurl_test_api_creds').click(function (event) {
    $(this).addClass('updating-message');
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
        .done(() => {
          $(this).removeClass('updating-message');

          // FIX: Use a static success message — no server data injected into DOM.
          $('button.payerurl_test_api_creds')
              .parent()
              .parent()
              .find('td')
              .html(
                  '<span id="payerurl-api-response" style="color:green">Both api key and secret key found. Saving credentials...</span>'
              );

          setTimeout(() => {
            $('button.woocommerce-save-button').trigger('click');
          }, 2000);
        })
        .fail((response) => {
          $(this).removeClass('updating-message');

          // FIX: Use .text() so the server error message is treated as plain text,
          // not HTML — prevents XSS if the API response contains malicious markup.
          const message =
              response.responseJSON?.data?.message
                  ? response.responseJSON.data.message
                  : 'An error occurred. Please check your credentials.';

          const $errorSpan = $('<span>')
              .attr('id', 'payerurl-api-response')
              .css('color', 'red')
              .text(message); // .text() escapes HTML — safe against XSS

          $('button.payerurl_test_api_creds')
              .parent()
              .parent()
              .find('td')
              .empty()
              .append($errorSpan);
        });
  });
});
