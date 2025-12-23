export const USER_PATTERNS = {
  USER: {
    CREATE: "user.create-user",
    GET_INFO: "user.get-user-info",
    GET_ME: "user.get-me",
    EDIT_INFO: "user.edit-user-info",
    SET_PROFILE_PICTURE: "user.set-profile-picture",
  },
  SELLER_APPLICATION: {
    CREATE: "user.create-seller-application",
    APPROVE: "user.approve-seller-application",
    CANCEL: "user.cancel-seller-application",
    DECLINE: "user.decline-seller-application",
    FIND_ONE: "user.find-one-seller-application",
    FIND_MANY: "user.find-many-seller-application",
  },
  STORE: {
    GET_INFO: "user.get-store-info",
    GET_MY: "user.get-my-store",
    SET_STORE_PICTURE: "user.set-store-picture",
  },
  ADDRESS: {
    ADD: "user.add-address",
    EDIT: "user.edit-address",
    DELETE: "user.delete-address",
    FIND_ONE: "user.find-one-address",
    FIND_MANY: "user.find-many-addresses",
  },
  WISHLIST: {
    ADD_ITEM: "wishlist.add-item",
    FIND_MANY_ITEMS: "wishlist.find-many-items",
    REMOVE_ITEM: "wishlist.remove-item",
    PRODUCT_STATUS_CHANGED: "wishlist.product-status-changed",
  },
};
