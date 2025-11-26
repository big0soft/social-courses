<?php
$payment_methods = [
    [
        'name' => 'Stripe',
        'sub_type' => 'stripe',
        'method' => 'POST',
        'route' => '/payments/stripe/payment',
        'logo' => asset('assets/payment/stripe.png'),
    ],
    [
        'name' => 'Paypal',
        'sub_type' => 'paypal',
        'method' => 'POST',
        'route' => '/payments/paypal/payment',
        'logo' => asset('assets/payment/paypal.png'),
    ],
    [
        'name' => 'Razorpay',
        'sub_type' => 'razorpay',
        'method' => 'POST',
        'route' => '/payments/razorpay/redirect',
        'logo' => asset('assets/payment/razorpay.png'),
    ],
    [
        'name' => 'Mollie',
        'sub_type' => 'mollie',
        'method' => 'POST',
        'route' => '/payments/mollie/payment',
        'logo' => asset('assets/payment/mollie.png'),
    ],
    [
        'name' => 'Paystack',
        'sub_type' => 'paystack',
        'method' => 'GET',
        'route' => '/payments/paystack/redirect',
        'logo' => asset('assets/payment/paystack.png'),
    ],
    [
        'name' => 'SSLCommerz',
        'sub_type' => 'sslcommerz',
        'method' => 'POST',
        'route' => '/payments/sslcommerz/payment',
        'logo' => asset('assets/payment/sslcommerz.png'),
    ],
];

foreach ($payments as $method) {
    foreach ($payment_methods as $item) {
        if ($item['sub_type'] == $method->sub_type) {
            $method['name'] = $item['name'];
            $method['route'] = $item['route'];
            $method['method'] = $item['method'];
            $method['logo'] = $item['logo'];
            break;
        }
    }
}
?>

<h6 class="mb-6 text-xl font-medium text-gray-600">
   {{ __('Available Payment methods') }}
</h6>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
   @foreach ($payments as $item)
      @if ($item->fields['active'])
         <div
            id="{{ $item['sub_type'] }}"
            data-info="{{ json_encode($item) }}"
            class="method payment_method cursor-pointer rounded-lg p-6 outline-1 hover:outline-2 hover:outline-blue-500"
         >
            <div class="flex h-full items-center justify-between">
               <p class="text-lg font-medium">{{ $item['name'] }}</p>
               <img
                  src="{{ $item['logo'] }}"
                  width="{{ $item['name'] == 'Paystack' ? '132' : '100' }}"
                  alt="{{ $item['name'] }}"
               />
            </div>
         </div>
      @endif
   @endforeach

   {{-- Prepaid Card Payment Method --}}
   <div
      id="prepaid_card"
      data-info="{{ json_encode(['sub_type' => 'prepaid_card', 'name' => 'Prepaid Card', 'route' => '/card/redeem', 'method' => 'POST']) }}"
      class="method payment_method cursor-pointer rounded-lg p-6 outline-1 hover:outline-2 hover:outline-blue-500"
   >
      <div class="flex h-full items-center justify-between">
         <div class="flex items-center gap-3">
            <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div>
               <p class="text-lg font-medium">{{ __('Prepaid Card') }}</p>
               <p class="text-sm text-gray-500">{{ __('Use a prepaid card code') }}</p>
            </div>
         </div>
      </div>
   </div>

</div>

{{-- Prepaid Card Code Input (Hidden by default, shown when prepaid card is selected) --}}
<div id="prepaid_card_input" class="mt-6 hidden">
   <div class="rounded-lg border border-gray-200 p-6 bg-gray-50">
      <label class="block text-sm font-medium text-gray-700 mb-2">
         {{ __('Enter Prepaid Card Code') }}
      </label>
      <div class="flex gap-2">
         <input
            type="text"
            id="card_code"
            name="card_code"
            class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-lg font-mono uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            maxlength="19"
         />
         <button
            type="button"
            id="validate_card"
            class="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
         >
            {{ __('Validate') }}
         </button>
      </div>
      <div id="card_validation_message" class="mt-3 hidden"></div>
      <div id="card_info" class="mt-4 hidden"></div>
   </div>
</div>
