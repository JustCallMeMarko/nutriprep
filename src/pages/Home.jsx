import { Show } from '@clerk/react-router'
import { Link } from 'react-router'

import logo from '../assets/icons/logo.png'
import link_icon from '../assets/icons/link_icon.svg'
import salad from '../assets/landing/salad.png'
import Step1 from '../assets/landing/step1.png'
import Step2 from '../assets/landing/step2.png'
import Step3 from '../assets/landing/step3.png'
import Food1 from '../assets/landing/Food1.png'
import Food2 from '../assets/landing/Food2.png'
import Food3 from '../assets/landing/Food3.png'
import info from '../assets/icons/info.svg'
import document_check from '../assets/icons/document_check.svg'
import precision from '../assets/icons/precision.svg'

const Header = () => {
  return (
    <header className="bg-white border-b-2 border-slate-800 px-56 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-2">
        <img src={logo} alt="NutriPrep Logo" className="w-10 h-10" />
        <p className="text-[36px] font-bold uppercase">NutriPrep</p>
      </div>

      <nav className="flex items-center gap-6">
        <a href="#home" className="hover:text-slate-600 transition-colors ease-in font-semibold">Home</a>
        <a href="#how" className="hover:text-slate-600 transition-colors ease-in font-semibold">How</a>
        <a href="#nutrition" className="hover:text-slate-600 transition-colors ease-in font-semibold">Nutrition</a>
        <a href="#prepai" className="hover:text-slate-600 transition-colors ease-in font-semibold">PrepAI</a>
        <a href="#faq" className="hover:text-slate-600 transition-colors ease-in font-semibold">FAQ</a>
      </nav>

      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <Link to="/sign-in" className="bg-zinc-900 text-white font-medium text-sm pl-5 pr-4 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors ease-in cursor-pointer flex items-center gap-2">
            Sign In
            <img src={link_icon} alt="Link" className="size-5" />
          </Link>
        </Show>
        <Show when="signed-in">
          <Link to="/dashboard">
            Go to Dashboard
          </Link>
        </Show>
      </div>
    </header>
  )
}

const Hero = () => {
  return (
    <section className="px-6 pt-24 flex flex-col items-center" id="home">
      <h1 className="text-6xl font-bold">
        What{' '}
        <span className="text-blue-600 underline">eating well</span>{' '}
        looks like
      </h1>
      <p className="mt-2 w-[46%] text-center text-lg font-semibold text-slate-700">
        Our commitment to high nutritional quality means better-tasting meals that empower you to own every summer moment.
      </p>
      <Link to="/sign-up" className="bg-blue-600 text-white font-semibold text-md px-8 py-2.5 rounded-lg hover:bg-blue-500 transition-colors ease-in-out cursor-pointer mt-4">
        Prep your meal now
      </Link>
      <img src={salad} alt="Salad" className="mt-8 w-[70%]" />
    </section>
  )
}

const StepCard = (props) => {
  return (
    <div>
      <div className="relative">
        <img src={props.image} alt={`Step ${props.index + 1}`} className="w-full" />
        <p className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-stone-400 border-3 border-white text-white font-semibold text-lg size-12 flex items-center justify-center rounded-full">
          {props.index + 1}
        </p>
      </div>
      <h3 className="text-xl font-semibold mt-8 text-center">{props.title}</h3>
      <p className="text-slate-700 mt-1 text-center">{props.description}</p>
    </div>
  )
}

const How = () => {
  const steps = [
    {
      image: Step1,
      title: "Customize your week",
      description: "Choose from 100+ high-protein, balance-focused meals every week. Pause, swap, or cancel anytime."
    },
    {
      image: Step2,
      title: "Delivered fresh weekly",
      description: "Choose from 100+ high-protein, balance-focused meals every week. Pause, swap, or cancel anytime."
    },
    {
      image: Step3,
      title: "Heat & fuel up",
      description: "Ready in just 2 minutes. Get clean, performance-ready nutrition without sacrificing your time."
    }
  ]
  return (
    <section className="px-6 flex flex-col items-center" id="how">
      <h1 className="text-6xl font-bold mb-4">How NutriPrep works</h1>
      <div className="w-[70%] grid grid-cols-3 mt-18 gap-8">
        {steps.map((step, index) => (
          <StepCard key={index} image={step.image} title={step.title} description={step.description} index={index} />
        ))}
      </div>
    </section>
  )
}

const Nutrition = () => {

  return (
    <section className="px-6 flex flex-col items-center" id="nutrition">
      <h1 className="text-6xl font-bold">Nutritious Meals!</h1>
      <p className="mt-2 w-[46%] text-center text-lg font-semibold text-slate-700">
        Discover whats perfect for you
      </p>
    </section>
  )
}

const PrepAI = () => {
  const macros = [
    { name: "Protein", value: "30g", goal: "40g" },
    { name: "Carbs", value: "50g", goal: "60g" },
    { name: "Fats", value: "10g", goal: "20g" }
  ]
  const foods = [
    { time: "Breakfast", name: "Braised Beef Flank", image: Food1 },
    { time: "Lunch", name: "Chicken Quinoa Bowl", image: Food2 },
    { time: "Dinner", name: "Lemon Herb Salmon", image: Food3 }
  ]
  return (
    <section className="px-6 flex flex-col items-center" id="prepai">
      <h1 className="text-6xl font-bold">PrepAI</h1>
      <p className="mt-2 w-[46%] text-center text-lg font-semibold text-slate-700">
        Plan meals using AI that suit your daily lifestyle
      </p>
      <div className="w-[60%] grid grid-cols-2 mt-18 gap-6">
        <div className="bg-zinc-900 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-white">Today</h3>
          <hr className="mt-3 border-slate-600" />
          <div className="grid grid-cols-3 gap-4 py-8">
            {macros.map((macro, index) => (
              <div key={index} className="h-24 rounded-xl flex flex-col items-center justify-center gap-1">
                <p className="text-white font-semibold text-center">{macro.name}</p>
                <div
                  className="size-14 rounded-full flex items-center justify-center"
                  style={{ background: `conic-gradient(#60a5fa ${(parseInt(macro.value) / parseInt(macro.goal)) * 100}%, #52525b 0)` }}
                >
                  <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <p className="text-white text-xs font-semibold">{macro.value}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-xs">Goal: {macro.goal}</p>
              </div>
            ))}
          </div>
          <div>
            {foods.map((food, index) => (
              <div key={index} className="flex items-center gap-4 mb-4">
                <img src={food.image} alt={food.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="text-slate-400 text-xs font-medium">{food.time}</p>
                  <p className="text-white font-medium">{food.name}</p>
                </div>
                <img src={info} alt="Info" className="size-6 opacity-50 ml-auto" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-zinc-900 rounded-xl h-64 p-8 flex flex-col items-center justify-center">
              <div className='bg-white/20 rounded-full p-3 border border-white/30 mb-4'>
                <img src={document_check} alt="Document Check" className="size-5.5" />
              </div>
              <h3 className="text-white font-semibold text-center text-xs">Inventory Synced</h3>
              <p className="text-zinc-300 text-xs text-center">Real Time Availability</p>
            </div>
            <div className="bg-zinc-900 rounded-xl h-64 p-8 flex flex-col items-center justify-center">
              <div className='bg-white/20 rounded-full p-3 border border-white/30 mb-4'>
                <img src={precision} alt="Document Check" className="size-5.5" />
              </div>
              <h3 className="text-white font-semibold text-center text-xs">Strict Macro Match</h3>
              <p className="text-zinc-300 text-xs text-center">Precision down to the gram</p>
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl flex-1 p-8 flex justify-between items-center">
            <div>
              <h2 className="text-white font-semibold text-lg">
                Instant Swaps
              </h2>
              <p className="text-slate-400 text-xs w-50">
                Adapt your plan instantly
                without breaking macros.
              </p>
            </div>
                <img src={Food1} alt="Braised Beef Flank" className="size-20 rounded-full border-2 border-white/20" />
          </div>
        </div>
      </div>
    </section>
  )
}

const FAQ = () => {
  return (
    <section className="px-6 flex flex-col items-center" id="faq">
    </section>
  )
}

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 px-6 py-8 text-sm text-slate-600">
      <div className="mx-auto max-w-5xl">Ready to build healthier routines.</div>
    </footer>
  )
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col gap-32.5">
        <Hero />
        <How />
        <Nutrition />
        <PrepAI />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}