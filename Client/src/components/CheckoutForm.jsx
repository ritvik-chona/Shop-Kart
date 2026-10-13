// A presentational form: the parent owns the values and the errors, this
// component only displays them and reports changes upward.
const FIELDS = [
  { name: "fullName", label: "Full Name", placeholder: "Aarav Sharma" },
  { name: "phone", label: "Phone Number", placeholder: "9876543210" },
  { name: "addressLine1", label: "Address", placeholder: "22 MG Road" },
  { name: "city", label: "City", placeholder: "Bengaluru" },
  { name: "state", label: "State", placeholder: "Karnataka" },
  { name: "pincode", label: "Pincode", placeholder: "560001" },
];

const CheckoutForm = ({ form, errors, onChange, disabled }) => {
  return (
    <section className="checkout-card">
      <h2>Shipping Details</h2>

      <div className="form-grid">
        {FIELDS.map((field) => (
          <div
            key={field.name}
            className={field.name === "addressLine1" ? "field wide" : "field"}
          >
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type="text"
              value={form[field.name]}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
            />
            {errors[field.name] && (
              <span className="error">{errors[field.name]}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CheckoutForm;
