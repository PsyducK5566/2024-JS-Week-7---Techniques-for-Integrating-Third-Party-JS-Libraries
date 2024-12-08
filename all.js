/*
「資料取得」、「卡片渲染」、「地區篩選」、「圓餅圖渲染」。
使用 Array.prototype.map 將資料陣列轉換為 HTML 字串
嚐試使用三元運算子直接判斷是否顯示所有地區的資料
嚐試使用 reduce 快速計算每個地區的數量
重複事件綁定的問題修正：確保 regionSearch 的事件監聽器只需綁定一次，避免重複呼叫 change 函式。
嚐試使用C3.js 
*/

// DOM 選取
const ticketCardArea = document.querySelector(".ticketCard-area");
const searchResult = document.querySelector("#searchResult-text");
const regionSearch = document.querySelector(".regionSearch");
const ticketName = document.querySelector(".ticketName");
const ticketImgURL = document.querySelector(".ticketImgURL");
const ticketArea = document.querySelector("#ticketArea");
const ticketPrice = document.querySelector(".ticketPrice");
const ticketNum = document.querySelector(".ticketNum");
const ticketLV = document.querySelector(".ticketLV");
const ticketDescribe = document.querySelector("#ticketDescription");
const cantFind = document.querySelector(".cantFind-area");
const addBTN = document.querySelector(".addBTN>button");
const form = document.getElementsByTagName("form");

// 資料初始化
let ticketData = [];

// 初始化函式
function init() {
  getData(); // 取得資料
  regionSearch.addEventListener("change", handleRegionChange); // 綁定地區篩選事件
}
init();

// 取得資料
function getData() {
  const url =
    "https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json";
  axios
    .get(url)
    .then((res) => {
      ticketData = res.data.data; // 儲存 API 資料
      renderList(ticketData); // 渲染初始資料
      renderDonutChart(ticketData); // 初始圓餅圖
    })
    .catch((err) => {
      console.error("資料加載失敗", err);
    });
}

// 渲染卡片列表
function renderList(data) {
  if (!data || data.length === 0) {
    cantFind.style.display = "block"; // 顯示「找不到資料」提示
    ticketCardArea.style.display = "none"; // 隱藏卡片區域
    searchResult.textContent = "本次搜尋共 0 筆資料";
    return;
  }

  cantFind.style.display = "none"; // 隱藏提示
  ticketCardArea.style.display = "flex"; // 顯示卡片區域

  let cardHTML = data
    .map(
      (item) => `
    <li class="ticketCard">
      <div class="ticketCard-img">
        <a href="#">
          <img src="${item.imgUrl}" alt="${item.name}" />
        </a>
        <div class="ticketCard-region">${item.area}</div>
        <div class="ticketCard-rank">${item.rate}</div>
      </div>
      <div class="ticketCard-content">
        <h3>
          <a href="#" class="ticketCard-name">${item.name}</a>
        </h3>
        <p class="ticketCard-description">${item.description}</p>
        <div class="ticketCard-info">
          <p class="ticketCard-num">
            <span><i class="fas fa-exclamation-circle"></i></span>
            剩下最後 <span>${item.group}</span> 組
          </p>
          <p class="ticketCard-price">
            TWD <span>$${item.price}</span>
          </p>
        </div>
      </div>
    </li>`
    )
    .join("");

  ticketCardArea.innerHTML = cardHTML; // 將卡片內容插入頁面
  searchResult.textContent = `本次搜尋共 ${data.length} 筆資料`; // 更新搜尋結果數量
}

// 地區篩選功能
function handleRegionChange(e) {
  const selectedRegion = e.target.value; // 取得選擇的地區
  const filteredData =
    selectedRegion === "全部地區"
      ? ticketData // 若選擇「全部地區」，顯示所有資料
      : ticketData.filter((item) => item.area === selectedRegion); // 篩選符合地區的資料
  renderList(filteredData); // 渲染篩選後的資料
  renderDonutChart(ticketData); // 更新圓餅圖
}

// 圓餅圖渲染
function renderDonutChart(data) {
  // 計算每個地區的數量
  const areaCount = data.reduce((acc, item) => {
    acc[item.area] = (acc[item.area] || 0) + 1;
    return acc;
  }, {});

  // 將物件轉換為陣列格式
  const chartData = Object.entries(areaCount);

  // 使用 c3.js 繪製圓餅圖
  c3.generate({
    bindto: "#chart",
    data: {
      columns: chartData,
      type: "donut",
    },
    donut: {
      title: "套票地區比重",
      width: 15,
      label: {
        show: false, // 隱藏數字標籤
      },
    },
    size: {
      width: 250, // 圖表寬度
      height: 250, // 圖表高度
    },
    color: {
      pattern: ["#E68618", "#5151D3", "#26BFC7"], // 設定地區代表顏色
    },
  });
}
