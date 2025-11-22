const ContactForm = () => {
  return (
    <div className="flex items-center justify-center w-full mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <div>
          <input
            className="w-full p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="name"
          />
        </div>
        <div>
          <input
            className="w-full p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="subject"
          />
        </div>
        <div className="md:col-span-2">
          <input
            className="w-full p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="email"
          />
        </div>
        <div className="md:col-span-2">
          <textarea
            className="w-full p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-32 resize-y"
            placeholder="content"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
