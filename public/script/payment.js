// Selecting the payment method
const methods = document.querySelectorAll(".payment_method");
if (methods) {
   function methodHandler(element) {
      element.classList.remove("outline-gray-300");
      element.classList.add("outline-2", "outline-blue-500");
      const info = JSON.parse(element.dataset.info);
      document.getElementById("paymentMethod").innerText = info.name;

      const checkoutForm = document.getElementById("checkoutForm");
      checkoutForm.setAttribute("method", info.method);
      checkoutForm.setAttribute("action", info.route);

      const phoneInput = document.getElementById("otpPhone");
      if (phoneInput) {
         if (info.sub_type == 'sslcommerz') {
            phoneInput.classList.remove("hidden");
            phoneInput.classList.add("block");
            phoneInput.setAttribute('required', true);
         } else {
            phoneInput.classList.add("hidden");
            phoneInput.classList.remove("block");
            phoneInput.removeAttribute('required')
         }
      }

      // Handle prepaid card input visibility
      const prepaidCardInput = document.getElementById("prepaid_card_input");
      if (prepaidCardInput) {
         if (info.sub_type == 'prepaid_card') {
            prepaidCardInput.classList.remove("hidden");
            prepaidCardInput.classList.add("block");
         } else {
            prepaidCardInput.classList.add("hidden");
            prepaidCardInput.classList.remove("block");
         }
      }
   }

   methods.forEach((element, index) => {
      element.classList.add("outline-gray-300");
      // checkoutForm
      if (index === 0) methodHandler(element);

      element.addEventListener("click", () => {
         methods.forEach((item) => {
            item.classList.add("outline-gray-300");
            item.classList.remove("outline-2", "outline-blue-500");
         });
         methodHandler(element);
      });
   });

   const checkout = document.getElementById("checkout");
   const paymentMethod = document.getElementById("paymentMethod").innerText;
   if (!Boolean(paymentMethod)) {
      checkout.setAttribute("disabled", true);
   }
}

// Prepaid card validation
const validateCardButton = document.getElementById("validate_card");
if (validateCardButton) {
   validateCardButton.addEventListener("click", async function() {
      const cardCodeInput = document.getElementById("card_code");
      const cardCode = cardCodeInput.value.trim();
      const messageDiv = document.getElementById("card_validation_message");
      const cardInfoDiv = document.getElementById("card_info");

      if (!cardCode) {
         messageDiv.innerHTML = '<div class="p-3 rounded bg-red-100 text-red-700 text-sm">Please enter a card code</div>';
         messageDiv.classList.remove("hidden");
         return;
      }

      // Show loading state
      validateCardButton.disabled = true;
      validateCardButton.textContent = "Validating...";
      messageDiv.innerHTML = '<div class="p-3 rounded bg-blue-100 text-blue-700 text-sm">Validating card code...</div>';
      messageDiv.classList.remove("hidden");
      cardInfoDiv.classList.add("hidden");

      try {
         const response = await fetch('/card/redeem/validate', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ code: cardCode })
         });

         const data = await response.json();

         if (response.ok && data.valid) {
            messageDiv.innerHTML = '<div class="p-3 rounded bg-green-100 text-green-700 text-sm">' + data.message + '</div>';

            // Show card info
            let courseInfo = '';
            if (data.card.card_type === 'single_course' && data.card.course) {
               courseInfo = '<p class="font-medium">' + data.card.course.title + '</p>';
            } else if (data.card.card_type === 'bundle' && data.card.bundleCourses.length > 0) {
               courseInfo = '<p class="font-medium">' + (data.card.title || 'Course Bundle') + '</p>';
               courseInfo += '<ul class="mt-2 space-y-1 text-sm">';
               data.card.bundleCourses.forEach(course => {
                  courseInfo += '<li>• ' + course.title + '</li>';
               });
               courseInfo += '</ul>';
            }

            cardInfoDiv.innerHTML = '<div class="p-4 rounded bg-white border border-green-200">' +
               '<p class="text-sm text-gray-600 mb-2">Card Details:</p>' +
               courseInfo +
               '</div>';
            cardInfoDiv.classList.remove("hidden");

            if (data.can_redeem) {
               // Update checkout button to redeem
               const checkoutButton = document.getElementById("checkout");
               checkoutButton.textContent = "Redeem Card & Enroll";
               const checkoutForm = document.getElementById("checkoutForm");
               checkoutForm.setAttribute("action", "/card/redeem/activate");
            }
         } else {
            messageDiv.innerHTML = '<div class="p-3 rounded bg-red-100 text-red-700 text-sm">' + data.message + '</div>';
            cardInfoDiv.classList.add("hidden");
         }
      } catch (error) {
         messageDiv.innerHTML = '<div class="p-3 rounded bg-red-100 text-red-700 text-sm">Failed to validate card. Please try again.</div>';
         cardInfoDiv.classList.add("hidden");
      } finally {
         validateCardButton.disabled = false;
         validateCardButton.textContent = "Validate";
      }
   });

   // Auto-format card code input
   const cardCodeInput = document.getElementById("card_code");
   if (cardCodeInput) {
      cardCodeInput.addEventListener("input", function(e) {
         let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
         let formatted = value.match(/.{1,4}/g)?.join('-') || value;
         e.target.value = formatted;
      });
   }
}
