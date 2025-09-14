document.addEventListener('DOMContentLoaded', function () {
	async function init() {
		// 1. Ambil Data Lokasi dari JSON
		async function getLocations() {
			try {
				const response = await fetch('data/locations.json');
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return await response.json();
			} catch (error) {
				console.error("Gagal memuat data lokasi:", error);
				return []; // Kembalikan array kosong jika gagal
			}
		}

		const locations = await getLocations();

		// Keluar jika tidak ada lokasi yang dimuat
		if (locations.length === 0) {
			console.error("Tidak ada data lokasi untuk ditampilkan.");
			return;
		}

		// 2. Inisialisasi Peta
		const map = L.map('map').setView([-7.7956, 110.3695], 10); // Center of Yogyakarta
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		const markers = [];
		const swiperWrapper = document.querySelector('.swiper-wrapper');

		// 3. Buat Slide dan Marker
		locations.forEach((location, index) => {
			// Buat slide untuk Swiper
			const slide = document.createElement('div');
			slide.classList.add('swiper-slide');
			slide.innerHTML = `
                <img src="${location.img}" alt="${location.name}">
                <div class="slide-content">
                    <h5>${location.name}</h5>
                    <p>${location.desc}</p>
                </div>
            `;
			swiperWrapper.appendChild(slide);

			// Buat marker untuk Leaflet
			const marker = L.marker([location.lat, location.lng])
				.addTo(map)
				.bindPopup(`<b>${location.name}</b>`);

			marker.on('click', () => {
				swiper.slideTo(index);
			});

			markers.push(marker);
		});

		// 4. Inisialisasi Swiper
		const swiper = new Swiper('.swiper', {
			effect: 'coverflow',
			grabCursor: true,
			centeredSlides: true,
			slidesPerView: 'auto',
			coverflowEffect: {
				rotate: 50,
				stretch: 0,
				depth: 100,
				modifier: 1,
				slideShadows: true,
			},
			loop: true,
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
		});

		// 5. Hubungkan Swiper ke Peta
		swiper.on('slideChange', function () {
			const activeIndex = swiper.realIndex;
			const activeLocation = locations[activeIndex];
			map.flyTo([activeLocation.lat, activeLocation.lng], 14, {
				animate: true,
				duration: 1.5
			});
			markers[activeIndex].openPopup();
		});

		// Buka popup pertama saat load
		if (markers.length > 0) {
			markers[0].openPopup();
		}
	}

	init();
});