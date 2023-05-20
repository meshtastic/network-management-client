![image](https://user-images.githubusercontent.com/46639306/229531059-2f07b9c1-982f-4eaa-aae7-b8663e1e94a5.png)

<div align="center">
  <h1 align="center">Hardware Recommendations</h1>
  <p align="center">My personal recommendations for hardware setups for use with the client.</p>
</div>
</p>

<p align="center">
  <a href="https://rakwireless.kckb.st/ab922280">
    <img alt="RAK Wireless Discount" src="https://img.shields.io/badge/Support%20Me-IOM8KP-blue" />
  </a>
</p>

## :warning: Disclaimer

Full disclosure -- I am a RAK affiliate. All views are my own, but I do personally have strong confidence in the modular approach to LoRa hardware that RAK takes. If you buy any product from RAK Wireless using the code `IOM8KP`, I will receive a slight commission and you will receive a slight discount. This helps me to continue to develop this client and other open source projects.

These are my personal recommendations for radio configurations that I've used in the past. The goal of this client is to be compatible with all Meshtastic devices, but I'm creating this document to help others who may be looking for a starting point when building their own Meshtastic network.

## :hammer: Hardware Recommendations

### Base Station

A base station is a classification of node that is intended to be used to manage a network. In this case, a node will be mounted in a fixed location and will be used to interact with other Meshtastic nodes at a network level.

For a base station, I recommend a radio connected to a local network via IP. Specifically, I recommend a radio connected to a local network via a [PoE Ethernet connection](https://en.wikipedia.org/wiki/Power_over_Ethernet). This means you only need to run a single cable to the radio, carrying both power and data. Additionally PoE is a well-supported standard, which simplifies building a case for the radio.

I recommend using the following RAK Wisblock base radio configuration:

* [WisBlock Base Board 2nd Gen](https://store.rakwireless.com/products/rak19007-wisblock-base-board-2nd-gen)
* [Nordic nRF52840 BLE Core Module for LoRaWAN with LoRa SX1262](https://store.rakwireless.com/products/nordic-nrf52840-ble-core-module-for-lorawan-with-lora-sx1262-rak4631-rak4631-c?variant=42576992436422)

Additionally, I recommend the following sensors to augment the base station:

* [GNSS GPS Location Module u-Blox MAX-7Q](https://store.rakwireless.com/products/rak1910-max-7q-gnss-location-sensor)
* [Environment Sensor BOSCH BME680](https://store.rakwireless.com/products/rak1906-bme680-environment-sensor) (depending on your use case)

Finally, I recommend the following PoE setup to power the base station:

* [Ethernet Module WIZnet W5100S-L ](https://store.rakwireless.com/products/rak13800-wisblock-ethernet-interface)
* [PoE Module Silvertel Ag9905MT for RAK13800](https://store.rakwireless.com/products/rak19018-poe-module-for-rak13800)
* [PoE Injector](https://store.rakwireless.com/products/poe-injector)*

> *Note that the PoE injector can be purchased from any manufacturer, but I recommend the one linked above as it is the one I use.

### Stationary Sensor Node

A stationary sensor node is a classification of node that is intended to be used to monitor a specific location. In this case, a node will be mounted in a fixed location and will be used to monitor the environment around it. This node will additionally serve as a repeater for other nodes in the network, but will not send text messages of its own.

For a stationary sensor node, I recomend a solar radio with a LiPo battery. The sensors attached to the node will depend on what specifically you're trying to monitor, but I've included a list of common sensors supported by Meshtastic below.

I recommend the following RAK Wisblock base radio configuration:

* [WisBlock Base Board 2nd Gen](https://store.rakwireless.com/products/rak19007-wisblock-base-board-2nd-gen)
* [Nordic nRF52840 BLE Core Module for LoRaWAN with LoRa SX1262](https://store.rakwireless.com/products/nordic-nrf52840-ble-core-module-for-lorawan-with-lora-sx1262-rak4631-rak4631-c?variant=42576992436422)

The following sensors are a sampling of those supported by Meshtastic from the Wisblock lineup:

* [Temperature and Humidity Sensor Sensirion SHTC3](https://store.rakwireless.com/products/rak1901-shtc3-temperature-humidity-sensor)
* [Environment Sensor BOSCH BME680](https://store.rakwireless.com/products/rak1906-bme680-environment-sensor) (air temp, humidity, pressure, air quality)
* [Barometric Pressure Sensor STMicroelectronics LPS22HB](https://store.rakwireless.com/products/rak1902-kps22hb-barometric-pressure-sensor)

For a stationary sensor node, I would recommend using a solar panel and LiPo battery to power the node. I personally use the following case, although I would highly recommend the [enclosures](https://discord.com/channels/867578229534359593/920180403799728210) and [solar-power](https://discord.com/channels/867578229534359593/970723761013800970) channels in the [Meshtastic Discord](https://discord.com/invite/ktMAKGBnBs) server for more information on this topic.

* [Unify Enclosure IP65 100x75x38 Solar](https://store.rakwireless.com/products/unify-enclosure-ip65-100x75x38-solar?variant=42533523620038)
* [Lithium Ion Battery - 3.7V 2000mAh](https://www.adafruit.com/product/2011)* (I've not personally tested this one yet!)

This enclosure includes an embedded solar panel as well as a LoRa antenna. Note the link lists the 902MHz - 928MHz version, but there also exists an 863MHz - 870MHz version. For regions using different LoRa bands, RAK also sells versions of this enclosure that don't include the LoRa antenna.

> *Note that you can use any JST-PH 3.7V battery, but I've included this link for illustrative purposes.

I would also recommend checking out [GarthVH](https://www.etsy.com/shop/GarthVH) on Etsy if you're interested in the static sensor use case. Garth makes a variety of pre-built Meshtastic devices, and is one of the core developers of the Meshtastic ecosystem.

### Router Node

I have no personal experience in this use case, but I've included a list of community-built devices below.

* [Solar Powered Off Grid LoRA Communications Meshtastic Mesh Network Router Node USB C](https://www.etsy.com/listing/1048791528/solar-powered-off-grid-lora)

### Mobile Tracker

I have no personal experience in this use case, but if you do feel free to open a PR! I will update this section when I can more confidently recommend a hardware configuration.

### Personal communication device

A personal communication device is a classification of node that is intended to be used primarily to communicate with either a base station or other personal communication devices on the network. A use case for this node would be in first response, where each responder or each team would be given a Meshtastic device. These devices would then form an ad-hoc network in addition to any static nodes in the region. These devices are then used in conjunction with the Meshtastic mobile clients ([Android](https://meshtastic.org/docs/category/android-app), [Apple](https://meshtastic.org/docs/category/apple-apps)).

For a personal communication device, portability and batter life are high priorities. I've personally only worked with TBeam devices, but I've also included other community-built devices below.

* [LILYGO® TTGO T-Beam](https://meshtastic.org/docs/hardware/devices/tbeam/)
* [LILYGO® TTGO T-Echo](https://meshtastic.org/docs/hardware/devices/techo/)
* [Meshtastic Battery Powered Personal LoRa Communicator with GPS](https://www.etsy.com/listing/1207992388/meshtastic-battery-powered-personal-lora)

I would also recommend checking out [QuantumShadow3D](https://www.etsy.com/shop/QuantumShadow3D) on Etsy if you're interested in the static sensor use case. QuantumShadow3D makes a variety of pre-built Meshtastic devices, and is a Meshtastic developer.
