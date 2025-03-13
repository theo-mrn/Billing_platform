import React from "react";
import { HoverEffect } from "../ui/card-hover-effect";

export function About() {
  return (
    <div className="max-w-6xl mx-auto px-8 -z-50">
      <HoverEffect items={projects} />
    </div>
  );
}
export const projects = [
    {
        title: "Next.js",
        description: "A React framework for production.",
        link: "/svg/next.png",
    },
    {
        title: "Node.js",
        description: "JavaScript runtime built on Chrome's V8 engine.",
        link: "/svg/node.svg",
    },
    {
        title: "PostgreSQL",
        description: "A powerful, open source object-relational database system.",
        link: "/svg/postgresql.png",
    },
    {
        title: "React",
        description: "A JavaScript library for building user interfaces.",
        link: "/svg/react.svg",
    },
    {
        title: "Docker",
        description: "A platform for developing, shipping, and running applications.",
        link: "/svg/docker.svg",
    },
    {
        title: "MongoDB",
        description: "A document database with the scalability and flexibility that you want.",
        link: "/svg/mongodb.svg",
    },
    {
        title: "Tailwind CSS",
        description: "A utility-first CSS framework for creating custom designs.",
        link: "/svg/tailwind.svg",
    },
    {
        title: "Resend",
        description: "A platform for sending emails.",
        link: "/svg/resend.png",
    },
    {
        title: "Casandra",
        description: "A highly scalable NoSQL database.",
        link: "/svg/cassandra.png",
    },
    {
        title: "TypeScript",
        description: "A typed superset of JavaScript that compiles to plain JavaScript.",
        link: "/svg/typescript.svg",
    },
    {
        title: "Stripe",
        description: "A technology company that builds economic infrastructure for the internet.",
        link: "/svg/stripe.png",
    },
    {
        title: "My SQL",
        description: "An open-source relational database management system.",
        link: "/svg/mysql.svg",
    },
];
