"use client"

import React, { useRef, createContext, useContext, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"


const SolarSystemContext = createContext()

const planetData = [
  { name: "mercury", color: "#8C7853", size: 0.15, distance: 3, label: "Mercury" },
  { name: "venus", color: "#FFC649", size: 0.2, distance: 4, label: "Venus" },
  { name: "earth", color: "#6B93D6", size: 0.25, distance: 5, label: "Earth" },
  { name: "mars", color: "#CD5C5C", size: 0.2, distance: 6.5, label: "Mars" },
  { name: "jupiter", color: "#D8CA9D", size: 0.8, distance: 9, label: "Jupiter" },
  { name: "saturn", color: "#FAD5A5", size: 0.7, distance: 12, label: "Saturn" },
  { name: "uranus", color: "#4FD0E7", size: 0.4, distance: 15, label: "Uranus" },
  { name: "neptune", color: "#4B70DD", size: 0.4, distance: 18, label: "Neptune" },
]

function useSolarSystem() {
  const context = useContext(SolarSystemContext)
  return (
    context || {
      planetSpeeds: {
        mercury: 2.0,
        venus: 1.5,
        earth: 1.0,
        mars: 0.8,
        jupiter: 0.4,
        saturn: 0.3,
        uranus: 0.2,
        neptune: 0.1,
      },
      updatePlanetSpeed: () => {},
    }
  )
}

function Planet({ name, color, size, distance }) {
  const meshRef = useRef()
  const { planetSpeeds } = useSolarSystem()

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      const speed = planetSpeeds[name] || 1

      meshRef.current.position.x = Math.cos(time * speed) * distance
      meshRef.current.position.z = Math.sin(time * speed) * distance
      meshRef.current.rotation.y = time * 2
    }
  })

  return React.createElement(
    "mesh",
    { ref: meshRef },
    React.createElement("sphereGeometry", { args: [size, 16, 16] }),
    React.createElement("meshBasicMaterial", { color: color }),
  )
}


function OrbitLine({ distance, color }) {
  const points = []
  const segments = 64

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance))
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  return React.createElement(
    "line",
    { geometry: geometry },
    React.createElement("lineBasicMaterial", { color: color, transparent: true, opacity: 0.6 }),
  )
}


function Sun() {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })

  return React.createElement(
    "mesh",
    { ref: meshRef },
    React.createElement("sphereGeometry", { args: [1, 16, 16] }),
    React.createElement("meshBasicMaterial", { color: "#FDB813" }),
  )
}

function SpeedControls() {
  const { planetSpeeds, updatePlanetSpeed } = useSolarSystem()

  const controlsStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "rgba(0, 0, 0, 0.9)",
    padding: "15px",
    borderRadius: "10px",
    color: "white",
    fontFamily: "Arial, sans-serif",
    minWidth: "220px",
    zIndex: 1000,
    border: "1px solid rgba(255, 255, 255, 0.1)",
  }

  const titleStyle = {
    margin: "0 0 15px 0",
    fontSize: "18px",
    textAlign: "center",
  }

  const sliderContainerStyle = {
    marginBottom: "12px",
  }

  const labelRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  }

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "bold",
  }

  const speedStyle = {
    fontSize: "12px",
    color: "#ccc",
  }

  const sliderStyle = {
    width: "100%",
    height: "6px",
    background: "#333",
    outline: "none",
    borderRadius: "3px",
    cursor: "pointer",
  }

  const helpStyle = {
    marginTop: "15px",
    fontSize: "11px",
    color: "#888",
    textAlign: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "10px",
  }

  return React.createElement(
    "div",
    { style: controlsStyle },
    
    ...planetData.map((planet) =>
      React.createElement(
        "div",
        { key: planet.name, style: sliderContainerStyle },
        React.createElement(
          "div",
          { style: labelRowStyle },
          React.createElement("label", { style: labelStyle }, planet.label),
          React.createElement("span", { style: speedStyle }, planetSpeeds[planet.name].toFixed(1) + "x"),
        ),
        React.createElement("input", {
          type: "range",
          min: "0",
          max: "3",
          step: "0.1",
          value: planetSpeeds[planet.name],
          onChange: (e) => updatePlanetSpeed(planet.name, Number.parseFloat(e.target.value)),
          style: sliderStyle,
        }),
      ),
    ),
   
  )
}

function SolarSystem() {
  return React.createElement(
    Canvas,
    {
      camera: { position: [15, 15, 15], fov: 60 },
    },
    React.createElement(OrbitControls, {
      target: [0, 0, 0],
      enableDamping: true,
      dampingFactor: 0.05,
      minDistance: 5,
      maxDistance: 50,
    }),
    React.createElement("ambientLight", { intensity: 0.6 }),
    React.createElement("pointLight", { position: [0, 0, 0], intensity: 1, color: "#FDB813" }),
    React.createElement(Sun),
    ...planetData.map((planet) =>
      React.createElement(
        "group",
        { key: planet.name },
        React.createElement(OrbitLine, { distance: planet.distance, color: planet.color }),
        React.createElement(Planet, {
          name: planet.name,
          color: planet.color,
          size: planet.size,
          distance: planet.distance,
        }),
      ),
    ),
  )
}

export default function App() {
  const [planetSpeeds, setPlanetSpeeds] = useState({
    mercury: 2.0,
    venus: 1.5,
    earth: 1.0,
    mars: 0.8,
    jupiter: 0.4,
    saturn: 0.3,
    uranus: 0.2,
    neptune: 0.1,
  })

  const updatePlanetSpeed = (planet, speed) => {
    setPlanetSpeeds((prev) => ({ ...prev, [planet]: speed }))
  }

  const containerStyle = {
    width: "100vw",
    height: "100vh",
    background: "black",
    position: "relative",
  }

  return React.createElement(
    SolarSystemContext.Provider,
    {
      value: { planetSpeeds, updatePlanetSpeed },
    },
    React.createElement(
      "div",
      { style: containerStyle },
      React.createElement(SolarSystem),
      React.createElement(SpeedControls),
    ),
  )
}
