// Firebase Configuration for KUMIA IL MANDORLA Dashboard
// These are placeholder values - replace with actual credentials in production

export const firebaseConfig = {
  apiKey: "AIzaSyB-h_b6SZlA-2BxCsylZ8aU_FEFxsCweDs",
  authDomain: "kumia-il-mandorla-smokehouse.firebaseapp.com",
  projectId: "kumia-il-mandorla-smokehouse",
  storageBucket: "kumia-il-mandorla-smokehouse.firebasestorage.app",
  messagingSenderId: "686928202587",
  appId: "1:686928202587:web:ef157dda6b97285f42687e",
  measurementId: "G-NQTP0EC2MV"
};

// Firebase services configuration
export const firebaseServices = {
  auth: {
    enabled: true,
    providers: ['google', 'custom_jwt'],
    fallbackEnabled: true
  },
  firestore: {
    enabled: true,
    collections: {
      feedback: 'feedback',
      reservations: 'reservations',
      customers: 'customers',
      menuItems: 'menu_items',
      points: 'points',
      notifications: 'notifications'
    }
  },
  functions: {
    enabled: true,
    triggers: {
      birthdayAutomation: 'birthday-automation',
      postVisitFeedback: 'post-visit-feedback',
      rewardActivation: 'reward-activation',
      referralTracking: 'referral-tracking',
      webhookListeners: 'webhook-listeners'
    }
  },
  analytics: {
    enabled: true,
    events: {
      menuView: 'menu_view',
      orderComplete: 'order_complete',
      feedbackSubmitted: 'feedback_submitted',
      nftReceived: 'nft_received',
      reservationCreated: 'reservation_created'
    }
  }
};

// Cloud Functions endpoints
export const cloudFunctions = {
  birthdayAutomation: {
    name: 'birthday-automation',
    trigger: 'schedule',
    schedule: '0 9 * * *', // Daily at 9 AM
    description: 'Send birthday messages and special offers'
  },
  postVisitFeedback: {
    name: 'post-visit-feedback',
    trigger: 'firestore',
    collection: 'reservations',
    description: 'Request feedback 24 hours after visit'
  },
  rewardActivation: {
    name: 'reward-activation',
    trigger: 'firestore',
    collection: 'points',
    description: 'Activate rewards when point thresholds are met'
  },
  referralTracking: {
    name: 'referral-tracking',
    trigger: 'firestore',
    collection: 'customers',
    description: 'Track and reward referrals'
  },
  webhookListeners: {
    name: 'webhook-listeners',
    trigger: 'https',
    endpoints: {
      meta: '/webhook/meta',
      stripe: '/webhook/stripe',
      mercadopago: '/webhook/mercadopago'
    },
    description: 'Handle external webhook events'
  }
};

// Offline fallback configuration
export const offlineConfig = {
  enabled: true,
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  fallbackData: {
    dashboard: {
      metrics: {
        total_customers: 0,
        total_reservations: 0,
        total_revenue: 0,
        avg_rating: 0
      }
    },
    notifications: {
      enabled: false,
      message: 'Sistema funcionando en modo offline'
    }
  }
};

export default firebaseConfig;