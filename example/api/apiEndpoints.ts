/**
 * API Endpoints organized by functional categories
 * Each category groups related endpoints for better maintainability
 */
export const ApiEndpoints = {
  // Authentication & Authorization
  auth: {
    signIn: "/users/signin",
    signUp: "/users/signup",
    socialGoogleSignIn: "/users/signin/social/mobile-google-new",
    socialGoogleSignUp: "/users/signup/social/mobile-google-new",
    socialAppleSignIn: "/users/signin/social/apple-mobile-new",
    socialAppleSignUp: "/users/signup/social/apple-mobile-new",
    logout: "/users/signout",
    forgotPassword: "/users/password/forgot",
    resetPassword: "/users/password/reset",
    refreshToken: "/users/refreshToken",
  },

  // User Management & Profile
  user: {
    // Profile
    getProfile: "/users/me",
    updateDetails: "/users",
    updatePassword: "/users/password",
    deleteAccount: (userId: string) => `/users/me/${userId}`,
    checkUserPayment: "/users/check-user-payment",

    // Communication Settings
    getCommunication: "/users/communication",
    updateCommunication: "/users/communication",

    // User History & Data
    getTicketsHistory: "/orders/user/history",
    getHistoryGroupedByRaffle: "/orders/user/history/grouped-by-raffle",
    getOrderHistoryV2: (orderId: string) =>
      `/orders/historyOrderV2/${orderId}/raffle`,

    // User Subscriptions Management
    getSubscriptions: "/users/me/subscriptions",
    updateSubscriptionCharity: (subscriptionId: string) =>
      `/users/me/subscriptions/${subscriptionId}/update`,
  },

  // Orders Management
  orders: {
    // Order Creation & Management
    create: "/orders",
    createUnAuth: "/orders/unAuth/create",
    selector: "/orders/selector",
    singlePurchase: "/orders/raffle-selector",

    // Order Processing
    verify: "/orders/verify",
    verifyUnAuth: "/orders/verifyUnAuth",
    reset: "/orders/reset",
    resetUnAuth: "/orders/reset/unauth",
    finalize: (orderId: string) => `/orders/${orderId}/finalize`,
    mergeMany: "/orders/many",
    boostData: "/orders/boost-data",

    // Order Deletion
    delete: "/orders",
    deleteUnAuth: "/orders/unAuth",
    deleteBatch: "/orders/batch",
    deleteUnAuthBatch: "/orders/unAuth/batch",

    // Order Enhancement
    updateBoost: "/orders/update-boost",
    updateBoostUnAuth: "/orders/update-boost/unAuth",

    // Order Validation
    validateMonthlyLimit: "/orders/monthly-limit",

    // Coupon Management
    getCoupon: (coupon: string) => `/coupons/get/${coupon}`,
  },

  // Subscriptions Management
  subscriptions: {
    // Subscription Models
    getActiveModels: "/subscription-models/active",
    getActiveModelsV2: "/subscription-models/active/v2",

    // Subscription Creation & Management
    create: "/subscriptions",
    createUnAuth: "/subscriptions/unAuth/create",
    updateMonthsPrepayType: "/subscriptions/update-subscription-months-type",

    // Subscription Control
    pause: (subscriptionId: string) => `/subscriptions/${subscriptionId}/pause`,
    unpause: (subscriptionId: string) =>
      `/subscriptions/${subscriptionId}/unpause`,

    // Subscription Deletion
    delete: "/subscriptions",
    deleteUnAuth: "/subscriptions/unAuth",
    deleteBatch: "/subscriptions/batch",
    deleteUnAuthBatch: "/subscriptions/unAuth/batch",

    // Subscription Enhancement
    updateBoost: "/subscriptions/update-boost",
    updateBoostUnAuth: "/subscriptions/update-boost/unAuth",
    updatePaymentCard: "/subscriptions/edit-payment-card",

    // Subscription Flow
    cancelSubscriptionChangeFlow: (subscriptionId: string) =>
      `/subscriptions/${subscriptionId}/flow/standard/change`,
    cancelSubscriptionFlowTooExpensive: (subscriptionId: string) =>
      `/subscriptions/${subscriptionId}/flow/standard/tooexpensive`,
    cancelSubscriptionFlowPause: (subscriptionId: string) =>
      `/subscriptions/${subscriptionId}/flow/standard/pause`,
    cancelSubscriptionFlowDiscount: (subscriptionId: string) =>
      `/subscriptions/${subscriptionId}/flow/standard/discount`,
    cancelSubscriptionFlowCancel: (subscriptionId: string) =>
      `/subscriptions/${subscriptionId}/flow/standard/cancel`,

    // Coupon Management
    getCoupon: (coupon: string) => `/coupons/get/subscription/${coupon}`,
  },

  // Shopping Basket
  basket: {
    get: "/basket",
    getUnAuth: "/basket/unAuth",
  },

  // Payment Processing
  payments: {
    // Checkout.com Integration
    createSession: "/payments/checkout/create-session",
    process: "/payments/checkout/process",
    processUnAuth: "/payments/checkout/process/unAuth",
    confirm: (paymentId: string) => `/payments/checkout/${paymentId}/confirm`,
    getDetails: (paymentId: string) => `/payments/checkout/${paymentId}`,

    // Payment Completion
    complete: "/orders/payment",
    completeUnAuth: "/orders/payment/unAuth",

    // PayPal Integration
    paypal: "/orders/payment/paypal",
    paypalUnAuth: "/orders/payment/paypal/unAuth",
    paypalCapture: "/orders/payment/paypal/capture",
    paypalCaptureUnAuth: "/orders/payment/paypal/capture/unAuth",

    // Token Management
    convertToken: "/orders/convert-token",
    convertTokenUnAuth: "/orders/convert-token/unAuth",

    // MentionMe Integration
    triggerMentionMePostPurchase: "/api/entry-point/v2/offer",
  },

  // Content & Public Data
  content: {
    // Raffles & Competitions
    activeRaffles: "/raffles/active/data",
    rafflesCountdowns: "/competitions/countdowns",

    // Bonus Draws
    getBonusDrawByRaffleId: "/bonusDraw/get",
    getActiveBonusDraws: "/bonusDraw/getActive",

    // Static Content
    homeContent: "/content",
    winners: "/winners/web",
    charities: "/charities/get/web-all",
  },
};
