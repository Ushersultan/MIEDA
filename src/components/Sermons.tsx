import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const Sermons = () => {
  return (
    <section id="sermons" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Video Preview */}
          <div className="relative group animate-scale-in">
            <div className="aspect-video bg-gradient-to-br from-primary to-accent rounded-2xl overflow-hidden shadow-2xl">
              <div className="w-full h-full flex items-center justify-center bg-black/20">
                <a
                  href="https://www.youtube.com/@VsdCommunicationMIEDA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-20 h-20 bg-primary-foreground/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer"
                  aria-label="Regarder le message sur YouTube"
                >
                  <Play className="w-10 h-10 text-primary ml-1" fill="currentColor" />
                </a>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-full blur-3xl opacity-50" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent rounded-full blur-3xl opacity-50" />
          </div>

          {/* Content */}
          <div className="animate-fade-in">
            <div className="inline-block px-4 py-2 bg-secondary/20 rounded-full mb-6">
              <span className="text-sm font-semibold text-secondary-foreground">
                Dernier Message
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              La Parole Transforme les Vies
            </h2>

            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
              Révérend Docteur Prophète Djeha Kouadio
            </p>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Découvrez comment la Parole de Dieu peut transformer votre vie.
              Rejoignez-nous chaque semaine pour des enseignements inspirants et puissants.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.youtube.com/@VsdCommunicationMIEDA/streams"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="text-lg px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Regarder le Message
                </Button>
              </a>

              <a
                href="https://www.youtube.com/@VsdCommunicationMIEDA/streams"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Voir Tous les Messages
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sermons;
