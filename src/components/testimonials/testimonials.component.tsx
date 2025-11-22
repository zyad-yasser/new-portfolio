import Partners from "../partners/partners.component";
import TestimonialsSlider from "../testimonials-slider/testimonials-slider.component";

const Testimonials = () => {
  return (
    <div className="flex items-center justify-center w-full py-20">
      <div className="flex items-center justify-center w-full">
        <div className="text-left max-w-6xl mx-auto px-4">
          <div className="w-full mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">Testimonials & Partners</h2>
            <div className="w-16 h-1 bg-primary mx-auto mb-12" />
            <div className="content mt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <TestimonialsSlider />
                </div>
                <div>
                  <Partners />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
