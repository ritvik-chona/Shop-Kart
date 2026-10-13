import mongoose from "mongoose";
import bcrypt from "bcrypt";

const customerSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        phone: {
            type: String,
            required: [true, "Phone is required"],
            trim: true,
        },
        // A list of Product ids, not copies of the products themselves.
        // The Product collection stays the single source of truth.
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        // A cart row needs more than a reference: it also carries how many
        // units the customer wants. Price is never copied in - the Product
        // document stays the source of truth for that.
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: [1, "Quantity cannot be less than 1"],
                },
            },
        ],
    },
    { timestamps: true }
);

// Hash the password before it is written to MongoDB.
// Runs on create() and save(), so no controller can forget to hash.
customerSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

customerSchema.methods.comparePassword = function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
