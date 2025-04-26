import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TypewriterEffect } from "../ui/typewriter-effect"
import { useContactForm } from "@/hooks/useContactForm"

export function Contact() {
  const {
    formData,
    isSubmitting,
    handleSubmit,
    handleChange
  } = useContactForm();

  const words = [
    {
      text: "Me",
    },
    {
      text: "Contacter",
    },
  ];

  return (
    <section className="pt-32 ">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center text-center mb-12"
        >
          <TypewriterEffect words={words} />
          <div className="w-20 h-1 bg-primary/50 rounded-full mt-4" />
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Card>
              <CardContent className="p-6">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Nom
                      </label>
                      <Input 
                        id="name" 
                        placeholder="Votre nom" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Sujet
                    </label>
                    <Input 
                      id="subject" 
                      placeholder="Sujet de votre message" 
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="Votre message" 
                      rows={5} 
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Envoi en cours..." : "Envoyer"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 

