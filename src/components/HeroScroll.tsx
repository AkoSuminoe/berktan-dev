"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

export default function HeroScroll() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <h2 className="text-3xl sm:text-4xl md:text-[4.5rem] font-bold tracking-tighter text-neutral-100 leading-tight md:leading-none">
            Crafting Digital
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Experiences
            </span>
          </h2>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&h=720&fit=crop&q=80"
          alt="Code on a dark screen"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
          priority
        />
      </ContainerScroll>
    </div>
  );
}
