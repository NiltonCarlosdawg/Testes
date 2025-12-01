export enum ActivityType {
  // User Activities
  USER_LOGIN = "user_login",
  USER_LOGIN_GOOGLE = "user_login_google",
  USER_LOGOUT = "user_logout",
  USER_REGISTRATION = "user_registration",
  PASSWORD_CHANGE = "password_change",
  PROFILE_UPDATE = "profile_update",
  
  // Navigation
  PAGE_VIEW = "page_view",
  SEARCH_PERFORMED = "search_performed",
  CATEGORY_VIEW = "category_view",
  
  // Product Activities (CRUD)
  PRODUCT_CREATED = "product_created",
  PRODUCT_UPDATED = "product_updated",
  PRODUCT_DELETED = "product_deleted",
  PRODUCT_VIEW = "product_view",
  PRODUCT_CLICK = "product_click",
  
  // Product Interactions
  ADD_TO_WISHLIST = "add_to_wishlist",
  REMOVE_FROM_WISHLIST = "remove_from_wishlist",
  PRODUCT_SHARE = "product_share",
  REVIEW_SUBMITTED = "review_submitted",
  REVIEW_HELPFUL = "review_helpful",
  
  // Cart Activities
  ADD_TO_CART = "add_to_cart",
  REMOVE_FROM_CART = "remove_from_cart",
  UPDATE_CART_QUANTITY = "update_cart_quantity",
  CART_ABANDONED = "cart_abandoned",
  CART_RECOVERED = "cart_recovered",
  
  // Order Activities
  ORDER_CREATED = "order_created",
  ORDER_UPDATED = "order_updated",
  ORDER_CANCELLED = "order_cancelled",
  ORDER_COMPLETED = "order_completed",
  PAYMENT_ATTEMPT = "payment_attempt",
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",

  // Loja (Store) Activities
  LOJA_CREATED = "loja_created",
  LOJA_UPDATED = "loja_updated",
  LOJA_DELETED = "loja_deleted",
  LOJA_APPROVED = "loja_approved",
  LOJA_REJECTED = "loja_rejected",

  // Notification Activities
  NOTIFICATION_SENT = "notification_sent",
  NOTIFICATION_READ = "notification_read",
  NOTIFICATION_READ_ALL = "notification_read_all",
  
  // System Activities
  ERROR_OCCURRED = "error_occurred",
  API_CALL = "api_call"
}

export enum EntityType {
  USER = "user",
  SESSION = "session",
  PRODUCT = "product",
  CATEGORY = "category",
  CART = "cart",
  ORDER = "order",
  PAYMENT = "payment",
  PAGE = "page",
  SEARCH = "search",
  LOJA = "loja",
  NOTIFICATION = "notification"
}