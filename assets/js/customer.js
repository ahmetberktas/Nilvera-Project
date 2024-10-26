const newAddCustomerButton = document.getElementById("newAddCustomer");
const productDrawer = document.getElementById("product-drawer");
const closeDrawerButton = document.getElementById("close-drawer");
const taxNumberInput = document.getElementById("taxNumber");
const nameInput = document.getElementById("name");

const apiKey =
  "7952AF3D95AA3BC39BBDBD28E8C165BF1E73E5DFD603845C2CC5119F79889887";

const apiUrl = "https://apitest.nilvera.com/general";

let page = 1;
let perPageSize = 10;
let totalPages = 0;
let searchTerm = "";
let sortColumn = "CreatedDate";
let sortType = "";
let visibleCustomers = [];
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

/* fetchCustomerData fonksiyonu  */
function fetchCustomerData() {
  const sortTypeParam = sortType
    ? `&SortType=${encodeURIComponent(sortType)}`
    : "";
  const apiUrlWithParams = `${apiUrl}/Customers?Search=${encodeURIComponent(
    searchTerm
  )}&PageSize=${perPageSize}&Page=${page}&SortColumn=${sortColumn}${sortTypeParam}`;

  axios
    .get(apiUrlWithParams, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    })
    .then((response) => {
      const content = response.data.Content;
      visibleCustomers = content;
      const totalCount = response.data.TotalCount;
      totalPages = Math.ceil(totalCount / perPageSize);

      document.getElementById("total-pages").innerText = totalCount;

      const tableBody = document.getElementById("data-table");
      tableBody.innerHTML = "";

      content.forEach((customer) => {
        const row = document.createElement("tr");
        row.classList.add(
          "bg-white",
          "border-b",
          "dark:bg-gray-800",
          "dark:border-gray-700",
          "hover:bg-gray-50",
          "dark:hover:bg-gray-600"
        );

        row.innerHTML = `<td class="w-4 p-4">
                    <div class="flex items-center">
                      <input
                        id="checkbox-table-search-${customer.ID}"
                        type="checkbox"
                        data-id="${customer.ID}"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        onchange="updateSelectedIds(this)"
                        />
                      <label for="checkbox-table-search-${
                        customer.ID
                      }" class="sr-only">checkbox</label>
                    </div>
                  </td>
                  <th
                    scope="row"
                    class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                  ${customer.Name}
                  </th>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-full bg-blue-500 text-white text-sm font-semibold">
                        ${customer.TaxNumber}
                    </span>
                </td>
                  <td class="px-6 py-4">
                    ${customer.TaxDepartment ? customer.TaxDepartment : ""}
                    </td>
                <td class="px-6 py-4">
                    ${
                      customer.Email
                        ? `
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-envelope text-gray-500"></i>
                            <span>${customer.Email}</span>
                        </div>
                        `
                        : ""
                    }
                    ${
                      customer.Phone
                        ? `
                        <div class="flex items-center space-x-2 mt-2">
                            <i class="fas fa-phone text-gray-500"></i>
                            <span>${customer.Phone}</span>
                        </div>
                        `
                        : ""
                    }
                </td>
                <td class="px-6 py-4">
                    ${
                      customer.City
                        ? `
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-city text-gray-500"></i>
                                <span>${customer.City}</span>
                            </div>
                            `
                        : ""
                    }
                    ${
                      customer.District
                        ? `
                            <div class="flex items-center space-x-2 mt-2">
                                <i class="fas fa-map-marker-alt text-gray-500"></i>
                                <span>${customer.District}</span>
                            </div>
                            `
                        : ""
                    }
                </td>
                  <td class="px-6 py-4 flex space-x-2">
                    <button 
                      class="flex items-center px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      data-taxNumber="${customer.TaxNumber}" data-id="${
          customer.ID
        }" onclick="handleEditClick(this)"
                    >
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      class="flex items-center px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      data-id="${customer.ID}" onclick="handleDeleteClick(this)"
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

/* Toplu Müşteri Silme Olayı */
document.getElementById("deleleAllCustomers").addEventListener("click", () => {
  if (selectedIds.length > 0) {
    axios
      .delete(`${apiUrl}/Customers/Bulk`, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json-patch+json",
          Authorization: `Bearer ${apiKey}`,
        },
        data: selectedIds,
      })
      .then((response) => {
        showToast("Seçilen Stoklar Silindi.", "success");
        fetchCustomerData();
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
    showToast("Müşteri seçmediniz!", "error");
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
  fetchCustomerData(); // Sayfa değiştiğinde verileri yeniden getir
}

// Seçim kutusuna olay dinleyici ekleyin
document.getElementById("data-count").addEventListener("change", function () {
  perPageSize = parseInt(this.value, 10);
  fetchCustomerData(); // Verileri güncelle
});

/* Arama butonuna tıklandığında çalışacak fonksiyon  */
document.getElementById("search-button").addEventListener("click", function () {
  searchTerm = document.getElementById("search-input").value;
  sortType = document.getElementById("sortType").value;
  sortColumn = document.getElementById("sortColumn").value;
  page = 1;
  fetchCustomerData();
});

function clearInputs() {
  document.getElementById("search-input").value = "";

  toggleClearButton();
}

function toggleClearButton() {
  const searchInput = document.getElementById("search-input").value;
  const clearButton = document.getElementById("clear-search");

  if (searchInput) {
    clearButton.classList.remove("hidden");
  } else {
    clearButton.classList.add("hidden");
  }
}

// Sayfa yüklendiğinde verileri getir
document.addEventListener("DOMContentLoaded", fetchCustomerData);

/* Pagination Geri Buttonu */
document.getElementById("prev").addEventListener("click", function () {
  if (page > 1) {
    page--;
    fetchCustomerData();
  }
});

/* Pagination İleri Buttonu */
document.getElementById("next").addEventListener("click", function () {
  if (page < totalPages) {
    page++;
    fetchCustomerData();
  }
});

/* Güncelleme Fonksiyonu (+) */
function handleEditClick(button) {
  const id = button.getAttribute("data-id");
  const idAsNum = Number(id);

  const selectedUser = visibleCustomers.find(
    (customer) => customer.ID === idAsNum
  );

  // Mevcut müşteri bilgilerini al
  const customerInfo = selectedUser;

  // Form alanlarını doldur
  document.getElementById("taxNumber").value = customerInfo.TaxNumber || "";
  document.getElementById("name").value = customerInfo.Name || "";
  document.getElementById("taxDepartment").value =
    customerInfo.TaxDepartment || "";
  document.getElementById("address").value = customerInfo.Address || "";
  document.getElementById("country").value = customerInfo.Country || "TR";
  document.getElementById("city").value = customerInfo.City || "";
  document.getElementById("district").value = customerInfo.District || "";
  document.getElementById("postalCode").value = customerInfo.PostalCode || "";
  document.getElementById("phone").value = customerInfo.Phone || "";
  document.getElementById("fax").value = customerInfo.Fax || "";
  document.getElementById("email").value = customerInfo.Email || "";
  document.getElementById("website").value = customerInfo.WebSite || "";
  document.getElementById("isExport").checked = customerInfo.IsExport || false;

  // Drawer'ı göster
  productDrawer.classList.remove("hidden");
  productDrawer.querySelector("div").classList.remove("translate-x-full");

  // Güncelleme işlemi
  document.getElementById("product-form").onsubmit = function (e) {
    e.preventDefault(); // Formun varsayılan gönderimini engelle

    // Müşteri bilgilerini al
    const updatedCustomerInfo = {
      ID: customerInfo.ID,
      TaxNumber: document.getElementById("taxNumber").value,
      Name: document.getElementById("name").value,
      TaxDepartment: document.getElementById("taxDepartment").value || "",
      Address: document.getElementById("address").value || "",
      Country: document.getElementById("country").value || "TR",
      City: document.getElementById("city").value || "",
      District: document.getElementById("district").value || "",
      PostalCode: document.getElementById("postalCode").value || "",
      Phone: document.getElementById("phone").value || "",
      Fax: document.getElementById("fax").value || "",
      Email: document.getElementById("email").value || "",
      WebSite: document.getElementById("website").value || "",
      IsExport: document.getElementById("isExport").checked,
    };

    // PUT isteğini gönder
    axios
      .put(`${apiUrl}/Customers`, updatedCustomerInfo, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json-patch+json",
          Authorization: `Bearer ${apiKey}`,
        },
      })
      .then((response) => {
        showToast("Müşteri bilgileri başarıyla güncellendi.", "success");
        fetchCustomerData();
        closeDrawer();
        productForm.reset();
      })
      .catch((error) => {
        showToast(
          `Güncelleme sırasında hata oluştu: ${error.response?.data || error}`,
          "error"
        );
      });
  };
}

/* Silme Fonksiyonu (+) */
function handleDeleteClick(button) {
  const id = button.getAttribute("data-id");

  /* Modal Aç */
  const modal = document.getElementById("confirmation-modal");
  modal.classList.remove("hidden");

  /* Onay butonuna tıklandığında silme işlemi */
  document.getElementById("confirm-button").onclick = function () {
    const url = `${apiUrl}/Customers/${id}`;
    axios
      .delete(url, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      })
      .then((response) => {
        showToast("Müşteri başarıyla silindi.", "success");
        modal.classList.add("hidden");
        fetchCustomerData();
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

/* Yeni Müşteri Ekleme (+) */
newAddCustomerButton.addEventListener("click", () => {
  const productForm = document.getElementById("product-form");
  productForm.reset();
  productDrawer.classList.remove("hidden");
  productDrawer.querySelector("div").classList.remove("translate-x-full");
  document.body.style.overflow = "hidden";

  if (taxNumberInput.value.trim() !== "") {
    nameInput.disabled = false;
  } else {
    nameInput.disabled = true;
  }

  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = [
      {
        TaxNumber: document.getElementById("taxNumber").value,
        Name: document.getElementById("name").value.toUpperCase(),
        TaxDepartment: document
          .getElementById("taxDepartment")
          .value.toUpperCase(),
        Address: document.getElementById("address").value.toUpperCase(),
        Country: document.getElementById("country").value,
        City: document.getElementById("city").value.toUpperCase(),
        District: document.getElementById("district").value.toUpperCase(),
        PostalCode: document.getElementById("postalCode").value,
        Phone: document.getElementById("phone").value,
        Fax: document.getElementById("fax").value,
        Email: document.getElementById("email").value,
        WebSite: document.getElementById("website").value,
        IsExport: document.getElementById("isExport").checked,
      },
    ];

    axios
      .post(`${apiUrl}/Customers`, formData, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json-patch+json",
          Authorization: `Bearer ${apiKey}`,
        },
      })
      .then((response) => {
        showToast("Yeni Müşteri başarıyla eklendi.", "success");
        fetchCustomerData();
        closeDrawer();
        productForm.reset();
      })
      .catch((err) => {
        showToast(
          `Ekleme işlemi sırasında hata oluştu: ${err.response?.data || err}`,
          "error"
        );
      });
  });
});

taxNumberInput.addEventListener("input", () => {
  nameInput.disabled = taxNumberInput.value.trim() === "";
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
