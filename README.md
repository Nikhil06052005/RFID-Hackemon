# 🔍 AI-Powered RFID Lost & Found System

A smart, scalable solution to track and recover lost items in real-time using **RFID, AI, and Cloud integration**.

## 🚨 Problem
Millions of items are lost annually in public places like airports, metros, and hotels, causing **stress, time loss, and security issues**. Traditional lost-and-found systems are manual, slow, and depend heavily on human effort.

## 🚀 Our Solution
An **AI-powered RFID system** that automates the item recovery process:

- RFID tags on items for unique identification
- ESP32 microcontroller and RFID scanner for real-time tracking
- Firebase for secure cloud storage and real-time data sync
- Web-based dashboard for instant alerts and status
- Scalable to smart campuses, public transport, malls, airports, and more

---

## 🌟 Features
- 🎯 Real-time item detection and logging
- 📲 Instant notifications via Web Portal
- 📡 ESP32 + RFID + Firebase integration
- 💻 Clean and responsive UI
- ⚡ Fast, automated, and reliable

---

## 🧩 Dependencies

### 🔧 Software & Web Technologies

| Dependency           | Version / Info        | Purpose                               |
|----------------------|----------------------|----------------------------------------|
| **Arduino IDE**      | 2.2.1+               | Programming ESP32 microcontroller      |
| **Firebase**         | Latest               | Cloud database & real-time storage     |
| **HTML / CSS / JS**  | Standard             | Frontend for the web portal            |
| **Bootstrap**        | 5.3                  | UI design and responsiveness           |

### 📚 Arduino Libraries

| Library Name       | Purpose                                  |
|--------------------|-----------------------------------------|
| `MFRC522`          | To interface with RFID RC522 module     |
| `SPI`              | SPI communication between ESP32 and RFID |
| `WiFi`             | ESP32 WiFi connectivity                 |
| `HTTPClient`       | Send data to Firebase or external server |

### ⚙️ Hardware Components

| Component                | Purpose                                  |
|--------------------------|------------------------------------------|
| **ESP32**                | Core controller and processor            |
| **RFID Scanner (RC522)** | Detects RFID-tagged items                |
| **RFID Tags**            | Attached to items                        |
| **Jumper Wires**         | Circuit connections                      |
| **Breadboard**           | Hardware prototyping platform            |

---

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
    https://github.com/Nikhil06052005/CodeForge
   ```

2. **Setup Web Portal**
   - Open `index.html` in browser (or use Live Server in VS Code)

3. **Setup Firebase**
   - Create a project in Firebase Console
   - Add your config keys to `firebase.js` or `.env`

4. **Upload Code to ESP32**
   - Open Arduino IDE
   - Install the required libraries via Library Manager
   - Select your board as `ESP32`
   - Upload the code from `esp32-code/main.ino`

5. **Hardware Connections**
   - Connect RC522 to ESP32 using SPI pins
   - Power the circuit with USB or 5V

---

## 🖼️ Demo & Media

### 📷 Project Photos
> (https://drive.google.com/drive/folders/1GEwAj8k6PxM7n1XuxAKo1ssfxcFo3m4T?usp=sharing)

### 🎥 Video Demo
> (https://youtu.be/fNc4tfdzuwY?si=nxwXW1-SpKHRCGb2)

---

## 👨‍💻 Team Members

| Name | Role |
| --- | --- |
| **Harshvardhan** | Hardware development and cloud integration (ESP32 + Firebase) |
| **Nikhil** | Developed the web portal and Firebase integration |
| **Sneha** | UI design and frontend enhancements |
| **Shivam Tripathi** | Project lead, media & documentation, and hardware contributor |

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contribution
Feel free to fork this repo and submit pull requests!
To contribute:
- Create a new branch
- Make your changes
- Submit a pull request

---

## 🔮 Future Scope

- 📱 Mobile app for item detection and alerts
- 🌍 GPS-based outdoor tracking
- 🧠 AI image recognition to identify items visually
- 🔐 Admin dashboard with analytics and user roles

---

> Made with ❤️ by Team Hackerworld_Geeks for the HACKEMON
