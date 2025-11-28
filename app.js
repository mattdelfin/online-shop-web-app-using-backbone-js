/* MODELS */
var Product = Backbone.Model.extend({
    defaults: {
        name: "",
        price: "",
        image: ""
    }
});

var Client = Backbone.Model.extend({
    defaults: {
        name: "",
        card: "",
        address: ""
    }
});

/* COLLECTIONS */
var ProductList = Backbone.Collection.extend({
    model: Product,
    localStorage: new Backbone.LocalStorage("products-storage")
});

var ClientList = Backbone.Collection.extend({
    model: Client,
    localStorage: new Backbone.LocalStorage("clients-storage")
});

var products = new ProductList();
var clients = new ClientList();

/* --------------------------
   PAGINATION SETTINGS
---------------------------*/
var ITEMS_PER_PAGE = 5;
var currentPage = 1;

/* PRODUCT VIEW */
var ProductItemView = Backbone.View.extend({
    tagName: "div",
    className: "product-card",

    template: _.template(`
        <strong><%= name %></strong> - ₱<%= price %><br>
        <% if (image) { %> <img src="<%= image %>"> <% } %>

        <div class="actions">
            <button class="buy">Buy</button>
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
        </div>
    `),

    events: {
        "click .delete": "deleteProduct",
        "click .edit": "editProduct",
        "click .buy": "buyProduct"
    },

    deleteProduct() {
        this.model.destroy();
        this.remove();
    },

    buyProduct() {
        alert("Product purchased!");
        this.model.destroy();
        this.remove();
    },

    editProduct() {
        $("#p-name").val(this.model.get("name"));
        $("#p-price").val(this.model.get("price"));
        $("#p-preview").attr("src", this.model.get("image")).show();
        window.currentEdit = this.model;
    },

    render() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

/* PRODUCT LIST + PAGINATION */
var ProductListView = Backbone.View.extend({
    el: "#product-list",

    initialize() {
        this.listenTo(products, "add remove change", this.render);
        products.fetch();
        this.render();
    },

    getPagedModels() {
        let start = (currentPage - 1) * ITEMS_PER_PAGE;
        return products.slice(start, start + ITEMS_PER_PAGE);
    },

    renderPagination() {
        let totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
        if (totalPages === 0) {
            $("#pagination").html("");
            return;
        }

        let html = "";

        for (let i = 1; i <= totalPages; i++) {
            html += `
                <button 
                    class="page-btn ${i === currentPage ? "active-page" : ""}" 
                    data-page="${i}">
                        ${i}
                </button>
            `;
        }

        $("#pagination").html(html);

        $(".page-btn").click(function () {
            currentPage = Number($(this).data("page"));
            products.trigger("change");
        });
    },


    render() {
        this.$el.html("");

        this.getPagedModels().forEach(model => {
            var item = new ProductItemView({ model });
            this.$el.append(item.render().el);
        });

        this.renderPagination();
    }
});

/* CLIENT VIEW */
var ClientItemView = Backbone.View.extend({
    tagName: "div",
    className: "client-card",

    template: _.template(`
        <strong><%= name %></strong><br>
        Card: <%= card %><br>
        Address: <%= address %><br>

        <div class="actions">
            <button class="edit-client">Edit</button>
            <button class="delete-client">Delete</button>
        </div>
    `),

    events: {
        "click .delete-client": "deleteClient",
        "click .edit-client": "editClient"
    },

    deleteClient() {
        this.model.destroy();
        this.remove();
    },

    editClient() {
        $("#c-name").val(this.model.get("name"));
        $("#c-card").val(this.model.get("card"));
        $("#c-address").val(this.model.get("address"));
        window.currentClientEdit = this.model;
    },

    render() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

/* CLIENT LIST VIEW */
var ClientListView = Backbone.View.extend({
    el: "#client-list",

    initialize() {
        this.listenTo(clients, "add remove change", this.render);
        clients.fetch();
        this.render();
    },

    render() {
        this.$el.html("");
        clients.each(model => {
            var item = new ClientItemView({ model });
            this.$el.append(item.render().el);
        });
    }
});

/* INITIALIZE */
new ProductListView();
new ClientListView();

/* IMAGE PREVIEW */
$("#p-image").on("change", function(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = evt => $("#p-preview").attr("src", evt.target.result).show();
    if (file) reader.readAsDataURL(file);
});

/* SAVE PRODUCT */
$("#p-save").click(function () {
    let data = {
        name: $("#p-name").val(),
        price: $("#p-price").val(),
        image: $("#p-preview").attr("src") || ""
    };

    if (window.currentEdit) {
        window.currentEdit.set(data);
        window.currentEdit.save();
        window.currentEdit = null;
    } else {
        products.create(data);
    }

    $("#p-name, #p-price").val("");
    $("#p-image").val("");
    $("#p-preview").hide();
});

/* SAVE/EDIT CLIENT */
$("#c-save").click(function () {

    let data = {
        name: $("#c-name").val(),
        card: $("#c-card").val(),
        address: $("#c-address").val()
    };

    if (window.currentClientEdit) {
        window.currentClientEdit.set(data);
        window.currentClientEdit.save();
        window.currentClientEdit = null;
    } else {
        clients.create(data);
    }

    $("#c-name, #c-card, #c-address").val("");
});
