const ContactIcons = () => {
  return (
    <div className="flex items-center justify-center w-full py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-6xl">
        <div className="flex items-center space-x-4 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
            <i className="lni-phone-handset text-primary text-xl" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase">mobile</div>
            <div className="text-card-foreground font-semibold">+201111980284</div>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
            <i className="lni-envelope text-primary text-xl" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase">email</div>
            <div className="text-card-foreground font-semibold">zyadyasser6@gmail.com</div>
          </div>
        </div>
        <div className="md:col-span-2 flex items-center space-x-4 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
            <i className="lni-pin text-primary text-xl" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase">Address</div>
            <div className="text-card-foreground">
              <p className="text-sm">B.62, Bank El-Eskan, Al-Dawahi, Port-Said, Egypt</p>
              <p className="text-sm">1st Tayaran St., Nasr City, Cairo, Egypt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactIcons;
