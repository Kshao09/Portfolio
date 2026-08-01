# AI World design map

## Core loop

1. Enter the simulation.
2. Move the third-person avatar with WASD / arrow keys.
3. Follow floating hologram beacons.
4. Press **E** near a beacon to open portfolio information.
5. Press **Space** to emit a scan pulse.
6. Collect eight knowledge nodes across the map.
7. Press **M** to view the environment map.

## Environments

| Environment | Portfolio meaning | Main props | Effects | Interaction |
|---|---|---|---|---|
| Inference Hub | About / model card | Six compute pillars, overhead halo, central beacon | Rotating ring, cyan glow | Background, interests, contact |
| Neural Forest | Skills and AI/ML growth | Neuron trees, graph links, node canopy | Pulsing emissive nodes, floating branches | Capability matrix |
| Data Lake | Backend and databases | Transparent lake, record cubes, data bridge | Rising records, shifting water opacity | Backend/data terminal |
| Project Lab | Selected work | Four terminals, lab arch, energy beam | Terminal screen pulses | One panel per project |
| Cloud Ridge | Cloud/deployment direction | Floating islands, cloud clusters | Slow drift and vertical bob | Deployment roadmap |
| Contact Portal | Contact and opportunities | Torus gate, energy disk, point light | Portal pulse and rotation | Email, LinkedIn, GitHub |

## Interactive props and effects

- **Hologram beacon:** proximity-based prompt; opens a modal panel.
- **Knowledge node:** collectible that increments the HUD counter.
- **Scan pulse:** expanding ring that visually re-emphasizes beacons.
- **Mini map:** live position and facing direction.
- **Zone discovery:** changes objective text and raises a toast.
- **Project terminal:** data-driven project content and links.
- **Avatar core:** animated light that reinforces the “player model” metaphor.

## Extension points

- Replace primitive geometry with GLTF environment assets.
- Add NPC guide agents with branching dialogue.
- Turn project terminals into playable technical demos.
- Save collected nodes and visited zones to `localStorage`.
- Add mobile joystick controls.
- Add lightweight spatial audio and sound toggles.
