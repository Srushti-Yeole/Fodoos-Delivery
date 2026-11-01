import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const url = "http://localhost:4000";
    const [food_list, setFoodList] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    // Add item to cart
    const addToCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));

        if (token) {
            try {
                await axios.post(
                    `${url}/api/cart/add`,
                    { itemId },
                    { headers: { token } }
                );
            } catch (error) {
                console.error("Error adding to remote cart:", error);
            }
        }
    };

    // Remove single quantity from cart
    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const updated = { ...prev };
            if (updated[itemId] > 1) {
                updated[itemId] -= 1;
            } else {
                delete updated[itemId];
            }
            return updated;
        });

        if (token) {
            try {
                await axios.post(
                    `${url}/api/cart/remove`,
                    { itemId },
                    { headers: { token } }
                );
            } catch (error) {
                console.error("Error removing from remote cart:", error);
            }
        }
    };

    // Remove item completely
    const deleteFromCart = async (itemId) => {
        const currentQty = cartItems[itemId] || 0;
        setCartItems((prev) => {
            const updated = { ...prev };
            delete updated[itemId];
            return updated;
        });

        if (token && currentQty > 0) {
            for (let i = 0; i < currentQty; i++) {
                try {
                    await axios.post(
                        `${url}/api/cart/remove`,
                        { itemId },
                        { headers: { token } }
                    );
                } catch (e) {
                    break;
                }
            }
        }
    };

    // Calculate total cart amount
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    // Calculate total item count in cart
    const getTotalCartItems = () => {
        let count = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                count += cartItems[item];
            }
        }
        return count;
    };

    // Clear cart locally and remotely
    const clearCart = async () => {
        setCartItems({});
        if (token) {
            try {
                await axios.post(`${url}/api/cart/clear`, {}, { headers: { token } });
            } catch (err) {
                console.error("Error clearing remote cart:", err);
            }
        }
    };

    // Fetch food list from backend
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success) {
                setFoodList(response.data.data);
            } else {
                toast.error("Failed to load food list");
            }
        } catch (error) {
            console.error("Food list fetch error:", error);
        }
    };

    // Load user cart from backend
    const loadCartData = async (authToken) => {
        try {
            const response = await axios.post(
                `${url}/api/cart/get`,
                {},
                { headers: { token: authToken } }
            );
            if (response.data.success && response.data.cartData) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.error("Error loading cart:", error);
        }
    };

    // Save token and user
    const saveAuth = (newToken, newUser) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem("token", newToken);
            loadCartData(newToken);
        } else {
            localStorage.removeItem("token");
        }

        setUser(newUser);
        if (newUser) {
            localStorage.setItem("user", JSON.stringify(newUser));
        } else {
            localStorage.removeItem("user");
        }
    };

    // Logout
    const logout = () => {
        saveAuth("", null);
        setCartItems({});
        toast.info("Logged out successfully");
    };

    useEffect(() => {
        async function init() {
            await fetchFoodList();
            if (token) {
                await loadCartData(token);
            }
        }
        init();
    }, [token]);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        deleteFromCart,
        getTotalCartAmount,
        getTotalCartItems,
        clearCart,
        url,
        token,
        setToken,
        user,
        setUser,
        saveAuth,
        logout,
        fetchFoodList
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
