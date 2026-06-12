import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const subject = encodeURIComponent(`Nouveau message depuis le site MIEDA - ${name}`);
    const body = encodeURIComponent(
      `Nom: ${name}\nEmail: ${email}\nTéléphone: ${phone}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:com@eglisesmieda.org?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contactez-Nous
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nous serions ravis de vous entendre. Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Card className="animate-scale-in bg-card">
            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                    Nom Complet
                  </label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Votre nom" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                    Email
                  </label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2 text-foreground">
                    Téléphone
                  </label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+xxxx xxx xxxx" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                    Message
                  </label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Votre message..." rows={5} />
                </div>

                <Button type="submit" size="lg" className="w-full text-lg">
                  Envoyer le Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* garde la partie Informations de Contact comme elle est */}
        </div>
      </div>
    </section>
  );
};

export default Contact;
