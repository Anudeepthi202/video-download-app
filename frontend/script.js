document.addEventListener("DOMContentLoaded", function () {
    const downloadButton = document.getElementById("download-btn");
    const upgradeButton = document.getElementById("pay-button");

    // ✅ Fetch Razorpay Key ID from Backend
    async function getRazorpayKey() {
        try {
            const response = await fetch("http://localhost:5000/api/razorpay/get-razorpay-key");
            const data = await response.json();
            return data.key;
        } catch (error) {
            console.error("Error fetching Razorpay Key:", error);
        }
    }

    // ✅ Create an Order for Payment
    async function createOrder(amount) {
        try {
            const response = await fetch("http://localhost:5000/api/razorpay/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error creating order:", error);
        }
    }

    // ✅ Verify Payment on Backend
    async function verifyPayment(orderId, paymentId, signature) {
        try {
            const response = await fetch("http://localhost:5000/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, paymentId, signature }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error verifying payment:", error);
        }
    }

    // ✅ Handle Razorpay Payment
    async function handlePayment() {
        try {
            const key = await getRazorpayKey();
            const order = await createOrder(500); // ₹500 in INR

            if (!order || !order.orderId) {
                console.error("Failed to create order");
                return;
            }

            const options = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: "Video Download Service",
                description: "Upgrade to Premium",
                order_id: order.orderId,
                handler: async function (response) {
                    const verification = await verifyPayment(
                        order.orderId,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    );

                    if (verification.success) {
                        alert("Payment Successful! You can now download unlimited videos.");
                        localStorage.setItem("premiumUser", "true"); // ✅ Store premium status
                    } else {
                        alert("Payment Verification Failed!");
                    }
                },
                prefill: { name: "Anudeepthi", email: "anudeepthi@example.com", contact: "9876543210" },
                theme: { color: "#28a745" }, // ✅ Green color like download button
            };

            const razorpay = new Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Error handling payment:", error);
        }
    }

    // ✅ Handle Video Download (Free Users: 1 per day)
    async function handleDownload() {
        const premiumUser = localStorage.getItem("premiumUser");
        const lastDownloadTime = localStorage.getItem("lastDownloadTime");
        const now = new Date().getTime();

        // ✅ Allow free users to download only once per day
        if (!premiumUser && lastDownloadTime && now - lastDownloadTime < 24 * 60 * 60 * 1000) {
            alert("You can only download one video per day. Upgrade to Premium for unlimited downloads!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/videos/download");

            if (response.status === 200) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "video.mp4";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // ✅ Store last download time for free users
                if (!premiumUser) {
                    localStorage.setItem("lastDownloadTime", now);
                }
            } else {
                alert("Error downloading video. Please try again.");
            }
        } catch (error) {
            console.error("Error downloading video:", error);
        }
    }

    // ✅ Event Listeners
    if (downloadButton) downloadButton.addEventListener("click", handleDownload);
    if (upgradeButton) upgradeButton.addEventListener("click", handlePayment);
});
