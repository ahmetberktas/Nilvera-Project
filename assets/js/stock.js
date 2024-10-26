const newAddStockButton = document.getElementById("newAddStock");
const productDrawer = document.getElementById("product-drawer");
const closeDrawerButton = document.getElementById("close-drawer");

const apiKey =
  "7952AF3D95AA3BC39BBDBD28E8C165BF1E73E5DFD603845C2CC5119F79889887";

const apiUrl = "https://apitest.nilvera.com/general";

let page = 1;
let perPageSize = 10;
let totalPages = 0;
let searchTerm = "";
let visibleStocks = [];
let selectedDate = "";
let selectedIds = [];

/* Toast Fonksiyonu */
function showToast(message, type) {
  const toastContainer = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `flex items-center p-4 mb-4 w-full max-w-xs text-white rounded-lg shadow-lg transition-opacity duration-300 ease-in-out 
    ${type === "success" ? "bg-green-500" : "bg-red-500"}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// fetchData fonksiyonu
function fetchData() {
  const apiUrlWithParams = `${apiUrl}/Stocks?Search=${encodeURIComponent(
    searchTerm
  )}&PageSize=${perPageSize}&Page=${page}`;

  axios
    .get(apiUrlWithParams, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    })
    .then((response) => {
      const content = response.data.Content;

      if (selectedDate) {
        const targetDate = new Date(selectedDate);
        visibleStocks = content.filter((item) => {
          const createdDate = new Date(item.CreatedDate);
          return (
            createdDate.getFullYear() === targetDate.getFullYear() &&
            createdDate.getMonth() === targetDate.getMonth() &&
            createdDate.getDate() === targetDate.getDate()
          );
        });
      } else {
        visibleStocks = content;
      }

      const totalCount = response.data.TotalCount; /* Toplam Kayıt Sayısı */
      totalPages = Math.ceil(
        totalCount / perPageSize
      ); /* Toplam sayfa sayısını hesapla */

      // Toplam kayıt sayısını güncelle
      document.getElementById("total-pages").innerText = totalCount;

      const tableBody = document.getElementById("data-table");
      // Eğer array boşsa tabloyu temizle
      if (visibleStocks.length === 0) {
        tableBody.innerHTML =
          "<tr><td colspan='8' class='text-center py-4'>No data available</td></tr>";
        return;
      }

      tableBody.innerHTML = ""; // Önce tabloyu temizle

      visibleStocks.forEach((stock) => {
        const row = document.createElement("tr");
        row.classList.add(
          "bg-white",
          "border-b",
          "dark:bg-gray-800",
          "dark:border-gray-700",
          "hover:bg-gray-50",
          "dark:hover:bg-gray-600"
        );

        const isActiveIcon = stock.IsActive
          ? `<svg class="w-3 h-3 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
           <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/>
         </svg>`
          : `<svg class="w-3 h-3 text-red-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
           <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1 L8 8 M1 8 L8 1"/>
         </svg>`;

        row.innerHTML = `<td class="w-4 p-4">
                    <div class="flex items-center">
                      <input
                        id="checkbox-table-search-${stock.ID}"
                        type="checkbox"
                        data-id="${stock.ID}"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        onchange="updateSelectedIds(this)" 
                      />
                      <label for="checkbox-table-search-${
                        stock.ID
                      }" class="sr-only">checkbox</label>
                    </div>
                  </td>
                  <th
                    scope="row"
                    class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                  ${stock.Name}
                  </th>
                  <td class="px-6 py-4">${stock.SellerCode}</td>
                  <td class="px-6 py-4">Adet</td>
                  <td class="px-6 py-4">${stock.Price}</td>
                  <td class="px-6 py-4">${stock.TaxPercent}</td>
                  <td class="px-6 py-4" data-icon-id="${
                    stock.ID
                  }">${isActiveIcon}</td>
                  <td class="px-6 py-4">${new Date(
                    stock.CreatedDate
                  ).toLocaleString("en-GB", { hour12: false })}</td>
                  <td class="px-6 py-4 flex space-x-2">
                    <button 
                      class="flex items-center px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      data-id="${stock.ID}" onclick="handleEditClick(this)"
                    >
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button 
                      class="flex items-center px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      data-id="${
                        stock.ID
                      }" onclick="handleDeactivateClick(this)"
                    >
                      <i class="fa-regular fa-circle-xmark"></i>
                    </button>
                    <button
                      class="flex items-center px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      data-id="${stock.ID}" onclick="handleDeleteClick(this)"
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>`;
        tableBody.appendChild(row);
      });

      updatePagination();
    })
    .catch((error) => {
      console.error("There was an error fetching the data!", error);
    });
}

// Tüm checkbox'ları seçmek için fonksiyon
function toggleSelectAll() {
  const selectAllCheckbox = document.getElementById("checkbox-all-search");
  const tableCheckboxes = document.querySelectorAll(
    'input[type="checkbox"][id^="checkbox-table-search-"]'
  );

  // Select all checkbox'ın seçili olup olmadığını kontrol et
  const isChecked = selectAllCheckbox.checked;

  // Seçilen checkbox'ların ID'lerini selectedIds'e ekle veya çıkar
  selectedIds = []; // Her tıklamada dizi sıfırlanır
  tableCheckboxes.forEach((checkbox) => {
    checkbox.checked = isChecked;

    if (isChecked) {
      const id = Number(checkbox.dataset.id); // data-id değerini al ve Number'a dönüştür
      if (id) {
        selectedIds.push(id); // Eğer ID mevcutsa ekle
      }
    }
  });

  // Benzersiz ID'ler ile selectedIds dizisini güncelle
  const unique = new Set(selectedIds);
  selectedIds = Array.from(unique);
}

// Checkbox durumu değiştiğinde selectedIds dizisini güncelle
function updateSelectedIds(checkbox) {
  const id = Number(checkbox.dataset.id); // data-id değerini al ve Number'a dönüştür

  if (checkbox.checked) {
    if (id && !selectedIds.includes(id)) {
      selectedIds.push(id); // Eğer ID mevcutsa ekle
    }
  } else {
    // Checkbox işaretlenmediğinde ID'yi diziden çıkar
    selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
  }
}

/* Toplu Stock Silme Olayı */
document.getElementById("deleleAllStock").addEventListener("click", () => {
  if (selectedIds.length > 0) {
    axios
      .delete(`${apiUrl}/Stocks/Bulk`, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json-patch+json",
          Authorization: `Bearer ${apiKey}`,
        },
        data: selectedIds,
      })
      .then((response) => {
        showToast("Seçilen Stoklar Silindi.", "success");
        fetchData();
        selectedIds = [];
      })
      .catch((err) => {
        showToast(
          `Toplu Silme işlemi sırasında hata oluştu: ${
            err.response?.data || err
          }`,
          "error"
        );
      });
  } else {
    showToast("Stok seçmediniz!", "error");
  }
});

// Fonksiyonu checkbox'ın `change` olayına bağlayalım
document
  .getElementById("checkbox-all-search")
  .addEventListener("change", toggleSelectAll);

function updatePagination() {
  const pageButtons = document.getElementById("page-buttons");
  pageButtons.innerHTML = ""; // Mevcut sayfa butonlarını temizle

  const maxVisibleButtons = 5; // Görüntülenecek maksimum buton sayısı

  // Sayfa numaralarını oluştur
  const startPage = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

  // '...' gösterimi için başlangıç ve bitiş sayfalarını kontrol et
  if (startPage > 1) {
    const firstButton = document.createElement("button");
    firstButton.innerText = "1";
    firstButton.onclick = () => setPage(1);
    firstButton.className =
      "px-4 py-2 mx-1 text-white bg-blue-500 rounded hover:bg-blue-600"; // Tailwind CSS sınıfları
    pageButtons.appendChild(firstButton);

    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.innerText = "...";
      ellipsis.className = "mx-2 text-gray-600"; // Tailwind CSS sınıfları
      pageButtons.appendChild(ellipsis);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement("button");
    button.innerText = i;
    button.onclick = () => setPage(i);
    button.className =
      "px-4 py-2 mx-1 text-white bg-blue-500 rounded hover:bg-blue-600"; // Tailwind CSS sınıfları
    if (i === page) {
      button.classList.add("bg-gray-500"); // Aktif sayfa için stil
    }
    pageButtons.appendChild(button);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.innerText = "...";
      ellipsis.className = "mx-2 text-gray-600"; // Tailwind CSS sınıfları
      pageButtons.appendChild(ellipsis);
    }
    const lastButton = document.createElement("button");
    lastButton.innerText = totalPages;
    lastButton.onclick = () => setPage(totalPages);
    lastButton.className =
      "px-4 py-2 mx-1 text-white bg-blue-500 rounded hover:bg-blue-600"; // Tailwind CSS sınıfları
    pageButtons.appendChild(lastButton);
  }

  // Önceki ve sonraki butonları etkinleştir
  document.getElementById("prev").disabled = page === 1;
  document.getElementById("next").disabled = page === totalPages;

  // Önceki buton için stil
  const prevButton = document.getElementById("prev");
  prevButton.className =
    "px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-300"; // Tailwind CSS sınıfları

  // Sonraki buton için stil
  const nextButton = document.getElementById("next");
  nextButton.className =
    "px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-300"; // Tailwind CSS sınıfları
}

// Sayfa ayarlama fonksiyonu
function setPage(newPage) {
  page = newPage;
  fetchData(); // Sayfa değiştiğinde verileri yeniden getir
}

// Seçim kutusuna olay dinleyici ekleyin
document.getElementById("data-count").addEventListener("change", function () {
  perPageSize = parseInt(this.value, 10);
  fetchData();
});

// Arama butonuna tıklandığında çalışacak fonksiyon
document.getElementById("search-button").addEventListener("click", function () {
  searchTerm = document.getElementById("search-input").value;
  selectedDate = document.getElementById("datepicker-autohide").value;
  page = 1;
  fetchData();
});

/* Arama Input Clear */
function clearInputs() {
  document.getElementById("search-input").value = "";

  toggleClearButton();
}

function toggleClearButton() {
  const searchInput = document.getElementById("search-input").value;
  const datepickerInput = document.getElementById("datepicker-autohide").value;
  const clearButton = document.getElementById("clear-search");

  if (searchInput) {
    clearButton.classList.remove("hidden");
  } else {
    clearButton.classList.add("hidden");
  }
}

/* Tarih Alanı Clear */
function clearDate() {
  const dateInput = document.getElementById("datepicker-autohide");
  dateInput.value = "";
  toggleClearButton();
}

function toggleClearButton() {
  const dateInput = document.getElementById("datepicker-autohide");
  const clearButton = document.getElementById("clear-date");

  /* Tarih alanı doluysa button göster */
  if (dateInput.value) {
    clearButton.classList.remove("hidden");
  } else {
    clearButton.classList.add("hidden");
  }
}

// Sayfa yüklendiğinde verileri getir
document.addEventListener("DOMContentLoaded", function () {
  fetchData();

  // Tarih giriş alanı için dinleyicileri
  const dateInput = document.getElementById("datepicker-autohide");
  dateInput.addEventListener("input", toggleClearButton);
  dateInput.addEventListener("change", toggleClearButton);

  dateInput.addEventListener("blur", toggleClearButton);
});

// Geri ve ileri butonları için olay dinleyicileri
document.getElementById("prev").addEventListener("click", function () {
  if (page > 1) {
    page--;
    fetchData();
  }
});

// Geri ve ileri butonları için olay dinleyicileri
document.getElementById("next").addEventListener("click", function () {
  if (page < totalPages) {
    page++;
    fetchData();
  }
});

/* Stock Güncelleme Fonksiyonu */
function handleEditClick(button) {
  const id = button.getAttribute("data-id");
  const idAsNum = Number(id);

  const selectedStock = visibleStocks.find((stock) => stock.ID === idAsNum);

  const stockInfo = selectedStock;
  document.getElementById("name").value = stockInfo.Name || "";
  document.getElementById("price").value = stockInfo.Price || "";
  document.getElementById("unitName").value = stockInfo.UnitName;
  document.getElementById("unitCode").value = stockInfo.UnitCode;
  document.getElementById("sellerCode").value = stockInfo.SellerCode || "";
  document.getElementById("buyerCode").value = stockInfo.BuyerCode || "";
  document.getElementById("manufacturerCode").value =
    stockInfo.ManufacturerCode || "";
  document.getElementById("isActive").checked = stockInfo.IsActive || false;
  document.getElementById("gtipCode").value = stockInfo.GTIPCode || "";
  document.getElementById("brand").value = stockInfo.Brand || "";
  document.getElementById("model").value = stockInfo.Model || "";
  document.getElementById("description").value = stockInfo.Description || "";
  document.getElementById("note").value = stockInfo.Note || "";
  document.getElementById("deliveryCode").value =
    stockInfo.DeliveryCode || "EXW";
  document.getElementById("shippingCode").value = stockInfo.ShippingCode;
  document.getElementById("taxPercent").value = stockInfo.TaxPercent;

  // Drawer'ı göster
  productDrawer.classList.remove("hidden");
  productDrawer.querySelector("div").classList.remove("translate-x-full");

  /* Güncelleme İşlemi */
  document.getElementById("product-form").onsubmit = function (e) {
    e.preventDefault();

    const updatedStockInfo = {
      ID: stockInfo.ID,
      Name: document.getElementById("name").value,
      UnitCode: document.getElementById("unitCode").value,
      UnitName: document.getElementById("unitName").value,
      Price: document.getElementById("price").value,
      SellerCode: document.getElementById("sellerCode").value,
      BuyerCode: document.getElementById("buyerCode").value,
      ManufacturerCode: document.getElementById("manufacturerCode").value,
      IsActive: document.getElementById("isActive").checked,
      GTIPCode: document.getElementById("gtipCode").value,
      Brand: document.getElementById("brand").value,
      Model: document.getElementById("model").value,
      Description: document.getElementById("description").value,
      Note: document.getElementById("note").value,
      ShippingCode: document.getElementById("shippingCode").value,
      DeliveryCode: document.getElementById("deliveryCode").value,
      TaxPercent: document.getElementById("taxPercent").value,
    };

    /* PUT isteğini gönder */
    axios
      .put(`${apiUrl}/Stocks`, updatedStockInfo, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json-patch+json",
          Authorization: `Bearer ${apiKey}`,
        },
      })
      .then((response) => {
        showToast("Stok bilgileri başarıyla güncellendi.", "success");
        fetchData();
        closeDrawer();
        this.reset();
      })
      .catch((error) => {
        showToast(
          `Güncelleme sırasında hata oluştu: ${error.response?.data || error}`,
          "error"
        );
      });
  };
}

/* Stock Aktiflik Durumu Değiştirme */
function handleDeactivateClick(button) {
  const id = button.getAttribute("data-id");
  button.setAttribute("disabled", true);
  const idAsNumber = Number(id);

  const selectedStock = visibleStocks.find((stock) => stock.ID === idAsNumber);
  const newIsActive = !selectedStock.IsActive;
  const updatedStock = { ...selectedStock, IsActive: newIsActive };
  axios
    .put(`${apiUrl}/Stocks`, updatedStock, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json-patch+json",
        Authorization: `Bearer ${apiKey}`,
      },
    })
    .then((response) => {
      visibleStocks = visibleStocks.map((stock) => {
        if (stock.ID === idAsNumber) {
          return updatedStock;
        }
        return stock;
      });
      const tdElement = button.closest("tr").querySelector("[data-icon-id]");
      const isActiveIcon = newIsActive
        ? `<svg class="w-3 h-3 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
           <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/>
         </svg>`
        : `<svg class="w-3 h-3 text-red-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
           <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1 L8 8 M1 8 L8 1"/>
         </svg>`;
      tdElement.innerHTML = isActiveIcon;
      showToast("Aktiflik durumu değiştirildi.", "success");
    })
    .catch((err) => {
      showToast(
        `Aktiflik durumu değiştirilirken hata oluştu: ${
          err.response?.data || err
        }`,
        "error"
      );
    })
    .finally(() => {
      button.removeAttribute("disabled");
    });
}

/* Silme Fonksiyonu */
function handleDeleteClick(button) {
  const id = button.getAttribute("data-id");

  /* Modal Aç */
  const modal = document.getElementById("confirmation-modal");
  modal.classList.remove("hidden");

  /* Onay butonuna tıklandığında silme işlemi */
  document.getElementById("confirm-button").onclick = function () {
    const url = `${apiUrl}/Stocks/${id}`;
    axios
      .delete(url, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      })
      .then((response) => {
        showToast("Stok bilgileri başarıyla silindi.", "success");
        modal.classList.add("hidden");

        // Silme işlemi sonrasında verileri yenile
        fetchData();
      })
      .catch((error) => {
        showToast(
          `Silme işlemi sırasında hata oluştu: ${
            error.response?.data || error
          }`,
          "error"
        );
      });
  };

  // Modalın iptal butonuna tıklanırsa
  document.getElementById("cancel-button").onclick = function () {
    modal.classList.add("hidden");
  };
}

/* Yeni Stok Ekleme */
newAddStockButton.addEventListener("click", () => {
  productDrawer.classList.remove("hidden");
  productDrawer.querySelector("div").classList.remove("translate-x-full");
  document.body.style.overflow = "hidden";

  const productForm = document.getElementById("product-form");

  if (!productForm.dataset.listenerAdded) {
    productForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const unitCodeValue = document.getElementById("unitCode").value || "C62";

      const formData = {
        Name: document.getElementById("name").value,
        UnitCode: unitCodeValue,
        UnitName: document.getElementById("unitName").value,
        Price: parseFloat(document.getElementById("price").value),
        SellerCode: document.getElementById("sellerCode").value,
        BuyerCode: document.getElementById("buyerCode").value,
        ManufacturerCode: document.getElementById("manufacturerCode").value,
        IsActive: document.getElementById("isActive").checked,
        GTIPCode: document.getElementById("gtipCode").value,
        Brand: document.getElementById("brand").value,
        Model: document.getElementById("model").value,
        Description: document.getElementById("description").value,
        Note: document.getElementById("note").value,
        DeliveryCode: document.getElementById("deliveryCode").value,
        ShippingCode: document.getElementById("shippingCode").value,
        TaxPercent: parseFloat(document.getElementById("taxPercent").value),
      };

      axios
        .post(`${apiUrl}/Stocks`, [formData], {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json-patch+json",
            Authorization: `Bearer ${apiKey}`,
          },
        })
        .then((response) => {
          showToast("Yeni Stok Bilgileri Başarıyla Eklendi.", "success");
          fetchData();
          closeDrawer();
          productForm.reset();
        })
        .catch((err) => {
          showToast(
            `Silme işlemi sırasında hata oluştu: ${err.response?.data || err}`,
            "error"
          );
        });
    });

    productForm.dataset.listenerAdded = "true";
  }
});

/* Modal Kapatma Tıklanma Olayı*/
closeDrawerButton.addEventListener("click", closeDrawer);

/* Modal Kapatma */
function closeDrawer() {
  productDrawer.querySelector("div").classList.add("translate-x-full");
  setTimeout(() => {
    productDrawer.classList.add("hidden");
  }, 300);
  document.body.style.overflow = "auto";
}
