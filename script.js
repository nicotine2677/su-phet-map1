// ขอบเขตมหาวิทยาลัย
const southWest = L.latLng(13.1020, 99.9440);
const northEast = L.latLng(13.1100, 99.9505);
const universityBounds = L.latLngBounds(southWest, northEast);

// สร้างแผนที่
const map = L.map("map", {
  maxBounds: universityBounds,
  maxBoundsViscosity: 1.0,
  minZoom: 16,
  maxZoom: 18,
}).setView([13.1056, 99.9474], 16);

// แผนที่พื้นหลัง
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let markers = JSON.parse(localStorage.getItem("markers") || "[]");
let routingControl = null;
let userLocation = null;

// เพิ่ม marker พร้อมปุ่มนำทาง
function addMarker(lat,lng){
  const marker = L.marker([lat,lng]).addTo(map);
  marker.bindPopup(`<b>Marker</b><br><button onclick="navigateTo(${lat},${lng})">นำทางไปที่นี่</button>`);
  markers.push([lat,lng]);
  localStorage.setItem("markers",JSON.stringify(markers));
}

markers.forEach((m)=>addMarker(m[0],m[1]));

// คลิกแผนที่เพื่อเพิ่ม marker
map.on("click",(e)=>{
  const {lat,lng}=e.latlng;
  if(universityBounds.contains([lat,lng])) addMarker(lat,lng);
  else alert("❌ อยู่นอกพื้นที่มหาวิทยาลัย!");
});

// หาตำแหน่งผู้ใช้
function getLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition((pos)=>{
      const lat=pos.coords.latitude;
      const lng=pos.coords.longitude;
      if(!universityBounds.contains([lat,lng])) {alert("ตำแหน่งคุณอยู่นอกมหาวิทยาลัย!");return;}
      userLocation=[lat,lng];
      L.marker(userLocation,{title:"ตำแหน่งของฉัน"}).addTo(map).bindPopup("📍 คุณอยู่ที่นี่").openPopup();
      map.setView(userLocation,17);
    });
  } else alert("ไม่สามารถใช้การระบุตำแหน่งได้");
}

// นำทางไปยัง marker + แสดงระยะทางและเวลา
function navigateTo(lat,lng){
  if(!userLocation){alert("กรุณากดปุ่ม 📍 หาตำแหน่งของฉันก่อน");return;}
  if(routingControl) map.removeControl(routingControl);
  routingControl=L.Routing.control({
    waypoints:[L.latLng(userLocation[0],userLocation[1]),L.latLng(lat,lng)],
    routeWhileDragging:false,
    show:true,
    lineOptions:{styles:[{color:'blue',opacity:0.6,weight:5}]},
    router: L.Routing.osrmv1({serviceUrl:'https://router.project-osrm.org/route/v1'})
  }).addTo(map);
}

// ส่งออก / นำเข้าหมุด
function exportMarkers(){
  const data=JSON.stringify(markers);
  navigator.clipboard.writeText(data);
  alert("คัดลอกหมุดไปยังคลิปบอร์ดแล้ว ✅");
}
function importMarkers(){
  const data=prompt("วางข้อมูลหมุดที่ต้องการนำเข้า:");
  if(!data) return;
  try{
    const newMarkers=JSON.parse(data);
    newMarkers.forEach((m)=>{if(universityBounds.contains(m)) addMarker(m[0],m[1]);});
    alert("นำเข้าหมุดสำเร็จ ✅");
  } catch{alert("รูปแบบข้อมูลไม่ถูกต้อง ❌");}
}
