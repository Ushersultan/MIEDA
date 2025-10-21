import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import communityImage from "@/assets/community-connect.jpg";

const Events = () => {
  const upcomingEvents = [
    {
      title: "Service du Dimanche",
      date: "Chaque Dimanche",
      time: "9:00 & 11:00",
      location: "Campus Principal",
    },
    {
      title: "Réunion de Prière",
      date: "Mercredi 25 Oct",
      time: "19:00",
      location: "En Ligne",
    },
    {
      title: "Conférence Jeunesse",
      date: "Samedi 28 Oct",
      time: "15:00",
      location: "Centre MIEDA",
    },
  ];

  return (
    <section id="events" className="py-24 bg-[var(--section-bg)]">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Content */}
          <div className="order-2 lg:order-1 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Événements à Venir
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Connectez-vous avec notre communauté lors de nos événements inspirants.
            </p>

            <div className="space-y-4 mb-8">
              {upcomingEvents.map((event, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-shadow bg-card"
                >
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-foreground">{event.title}</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button size="lg" variant="default" className="text-lg px-8">
              Voir Tous les Événements
            </Button>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 animate-scale-in">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={communityImage} 
                alt="Community Connection" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Events;
