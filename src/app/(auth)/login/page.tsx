"use client";

import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { PageTransition } from "@/components/animations/page-transition";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <PageTransition>
      <div className="grid h-screen md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 1,
          }}
          className="relative z-10 flex h-screen md:order-1"
        >
          <div className="flex-1 flex items-center justify-center p-8">
            <LoginForm />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 1,
            delay: 0.1,
          }}
          className="relative hidden h-screen md:block md:order-2"
        >
          <Image
            src="/placeholder.svg"
            alt="Login illustration"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </div>
    </PageTransition>
  );
}