import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const loginPanel = document.getElementById("login-panel");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginStatus = document.getElementById("login-status");
const dashboardStatus = document.getElementById("dashboard-status");
const orderList = document.getElementById("order-list");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginStatus.textContent = "Signing in...";
    const { error } = await supabase.auth.signInWithPassword({
        email: document.getElementById("admin-email").value.trim(),
        password: document.getElementById("admin-password").value
    });
    if (error) {
        loginStatus.textContent = "Sign-in failed. Check your credentials.";
        return;
    }
    await showDashboard();
});

document.getElementById("sign-out").addEventListener("click", async () => {
    await supabase.auth.signOut();
    dashboard.hidden = true;
    loginPanel.hidden = false;
});

document.getElementById("refresh-orders").addEventListener("click", loadOrders);

async function showDashboard() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    loginPanel.hidden = true;
    dashboard.hidden = false;
    await loadOrders();
}

async function loadOrders() {
    dashboardStatus.textContent = "Loading orders...";
    orderList.replaceChildren();
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) {
        dashboardStatus.textContent = "Could not load orders. Confirm the admin account and database policies are configured.";
        console.error(error);
        return;
    }
    dashboardStatus.textContent = data.length ? `${data.length} order(s)` : "No orders yet.";
    for (const order of data) {
        const card = document.createElement("article");
        card.className = "order-card";
        const title = document.createElement("h2");
        title.textContent = order.customer_name + " — " + order.item_type;
        const meta = document.createElement("p");
        meta.className = "order-meta";
        meta.textContent = order.customer_email + " • " + new Date(order.created_at).toLocaleString();
        const description = document.createElement("p");
        description.textContent = order.design_description || "No design details provided.";
        const status = document.createElement("p");
        status.textContent = "Status: " + order.status.replace("_", " ");
        card.append(title, meta, description, status);

        if (order.reference_image_path) {
            const { data: imageData, error: imageError } = await supabase.storage
                .from("order-references")
                .createSignedUrl(order.reference_image_path, 300);
            if (!imageError && imageData?.signedUrl) {
                const link = document.createElement("a");
                link.href = imageData.signedUrl;
                link.target = "_blank";
                link.rel = "noopener";
                link.className = "reference-link";
                link.textContent = "View reference image (5-minute link)";
                card.append(link);
            }
        }

        const actions = document.createElement("div");
        actions.className = "order-actions";
        const select = document.createElement("select");
        for (const [value, label] of [["pending","Pending"],["in_progress","In progress"],["completed","Completed"],["cancelled","Cancelled"]]) {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            option.selected = value === order.status;
            select.append(option);
        }
        const save = document.createElement("button");
        save.textContent = "Update status";
        save.addEventListener("click", async () => {
            save.disabled = true;
            const { error: updateError } = await supabase.from("orders").update({ status: select.value }).eq("id", order.id);
            save.disabled = false;
            dashboardStatus.textContent = updateError ? "Status update failed." : "Order status updated.";
            if (updateError) console.error(updateError);
            else await loadOrders();
        });
        actions.append(select, save);
        card.append(actions);
        orderList.append(card);
    }
}

supabase.auth.onAuthStateChange((_event, session) => {
    if (session) showDashboard();
});
showDashboard();
