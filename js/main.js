document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    const currentYearElem = document.getElementById('currentYear');
    if (currentYearElem) {
        currentYearElem.textContent = new Date().getFullYear();
    }

    const cartIconCount = document.getElementById('cart-icon-count');
    const notificationArea = document.getElementById('notification-area');

    function getCart() {
        try {
            const cart = JSON.parse(localStorage.getItem('urbanStyleCart')) || [];
            return cart;
        } catch (e) {
            console.error("Error al leer el carrito de localStorage:", e);
            showNotification("Hubo un error al cargar tu carrito.", 'error');
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem('urbanStyleCart', JSON.stringify(cart));
            updateCartIcon(cart);
        } catch (e) {
            console.error("Error al guardar el carrito en localStorage:", e);
            showNotification("No se pudo actualizar el carrito. Puede que el almacenamiento esté lleno.", 'error');
        }
    }

    function updateCartIcon(cartArray = null) {
        if (!cartIconCount) return;
        const cart = cartArray || getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartIconCount.textContent = totalItems;
        if (totalItems > 0) {
            cartIconCount.classList.remove('hidden');
        } else {
            cartIconCount.classList.add('hidden');
        }
    }

    function showNotification(message, type = 'info') {
        if (!notificationArea) {
            console.warn("Área de notificaciones no encontrada (ID 'notification-area'). Mensaje:", message);
            return;
        }

        const notification = document.createElement('div');
        notification.classList.add('p-3', 'mb-2', 'rounded-md', 'text-sm', 'font-semibold', 'flex', 'items-center', 'shadow-md', 'transform', 'transition-transform', 'ease-out', 'duration-300', 'translate-x-full', 'opacity-0');

        let iconSvg = '';
        if (type === 'success') {
            notification.classList.add('bg-green-500', 'text-white');
            iconSvg = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />';
        } else if (type === 'error') {
            notification.classList.add('bg-red-500', 'text-white');
            iconSvg = '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />';
        } else {
            notification.classList.add('bg-blue-500', 'text-white');
            iconSvg = '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />';
        }

        notification.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                ${iconSvg}
            </svg>
            <span>${message}</span>
        `;

        notificationArea.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
            notification.classList.add('translate-x-0', 'opacity-100');
        });

        setTimeout(() => {
            notification.classList.remove('translate-x-0', 'opacity-100');
            notification.classList.add('translate-x-full', 'opacity-0');
            notification.addEventListener('transitionend', () => {
                notification.remove();
            }, { once: true });

        }, 4000);
    }

    if (document.getElementById('product-gallery')) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const productCards = document.querySelectorAll('.product-card');
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('bg-gray-700', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });
                button.classList.remove('bg-gray-200', 'text-gray-700');
                button.classList.add('bg-gray-700', 'text-white');

                const filter = button.getAttribute('data-filter');

                productCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        const allFilterButton = document.querySelector('.filter-btn[data-filter="all"]');
        if (allFilterButton) {
            setTimeout(() => {
                allFilterButton.click();
            }, 0);
        }

        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const card = event.target.closest('.product-card');
                const productId = card.dataset.id;
                const name = card.dataset.name;
                const price = parseFloat(card.dataset.price);
                const image = card.dataset.image;

                let cart = getCart();
                const existingProductIndex = cart.findIndex(item => item.id === productId);

                if (existingProductIndex > -1) {
                    cart[existingProductIndex].quantity += 1;
                } else {
                    if (isNaN(price)) {
                         console.error(`Error: Precio inválido para el producto ${productId} ("${name}") - Valor: ${card.dataset.price}`);
                         showNotification(`Error al agregar "${name}": Precio inválido.`, 'error');
                         return;
                    }
                    cart.push({ id: productId, name, price, image, quantity: 1 });
                }

                saveCart(cart);
                showNotification(`"${name}" agregado al carrito.`, 'success');
            });
        });
    }

    if (document.getElementById('cart-items-table')) {
        const cartItemsTableBody = document.getElementById('cart-items-table');
        const cartSubtotalElem = document.getElementById('cart-subtotal');
        const cartTotalElem = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');

        function renderCartPage() {
            const cart = getCart();
             if (cartItemsTableBody) {
                 cartItemsTableBody.removeEventListener('click', handleCartActions);
             }

            cartItemsTableBody.innerHTML = '';
            let subtotal = 0;

            if (cart.length === 0) {
                cartItemsTableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Tu carrito está vacío.</td></tr>';
                if(checkoutBtn) {
                    checkoutBtn.disabled = true;
                    checkoutBtn.classList.add('disabled:opacity-50', 'cursor-not-allowed');
                }
            } else {
                cart.forEach((item) => {
                    const itemSubtotal = item.price * item.quantity;
                    subtotal += itemSubtotal;

                    const row = cartItemsTableBody.insertRow();
                    row.classList.add('cart-item');
                    row.dataset.id = item.id;

                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <img class="h-10 w-10 rounded-full object-cover" src="${item.image}" alt="${item.name}">
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">${item.name}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">$${item.price ? item.price.toFixed(2) : 'N/A'}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <button class="quantity-btn decrease-quantity-btn px-2 py-1 border border-gray-300 rounded-l-md bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400" data-id="${item.id}">-</button>
                                <input type="number" value="${item.quantity}" min="1" class="w-16 text-center px-0 py-1 border-t border-b border-gray-300 text-sm quantity-input focus:outline-none focus:ring-blue-500 focus:border-blue-500 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0" data-id="${item.id}">
                                <button class="quantity-btn increase-quantity-btn px-2 py-1 border border-gray-300 rounded-r-md bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400" data-id="${item.id}">+</button>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900 subtotal-price">${item.price && item.quantity ? `$${(item.price * item.quantity).toFixed(2)}` : 'N/A'}</div>
                        </td>
                        <td class="px-6 py-4 text-center whitespace-nowrap text-sm font-medium">
                            <button class="text-red-600 hover:text-red-800 remove-item-btn focus:outline-none focus:ring focus:ring-red-300" data-id="${item.id}">Eliminar</button>
                        </td>
                    `;
                });

                if(checkoutBtn) {
                    checkoutBtn.disabled = false;
                    checkoutBtn.classList.remove('disabled:opacity-50', 'cursor-not-allowed');
                }
            }

            if(cartSubtotalElem) cartSubtotalElem.textContent = `$${subtotal.toFixed(2)}`;
            if(cartTotalElem) cartTotalElem.textContent = `$${subtotal.toFixed(2)}`;


            if (cartItemsTableBody) {
                cartItemsTableBody.addEventListener('click', handleCartActions);

                 document.querySelectorAll('.quantity-input').forEach(input => {
                     input.addEventListener('input', handleQuantityChangeOnCartPage);
                 });
            }
        }

        function handleCartActions(event) {
            const target = event.target;
            const productId = target.dataset.id;

            if (!productId || !(target.classList.contains('quantity-btn') || target.classList.contains('remove-item-btn'))) {
                return;
            }

            if (target.classList.contains('remove-item-btn')) {
                handleRemoveItemOnCartPage(productId);
            }

            if (target.classList.contains('quantity-btn')) {
                const input = target.closest('td').querySelector('.quantity-input');
                if (!input) return;

                let currentQuantity = parseInt(input.value);

                if (target.classList.contains('increase-quantity-btn')) {
                    currentQuantity++;
                } else if (target.classList.contains('decrease-quantity-btn') && currentQuantity > 1) {
                    currentQuantity--;
                } else {
                    return;
                }

                input.value = currentQuantity;
                 const inputEvent = new Event('input', { bubbles: true });
                 input.dispatchEvent(inputEvent);

                 input.focus();
            }
        }

         function handleQuantityChangeOnCartPage(event) {
            const input = event.target;
            const productId = input.dataset.id;
            let newQuantity = parseInt(input.value);

            if (isNaN(newQuantity) || newQuantity < 1) {
                newQuantity = 1;
                input.value = 1;
            }

            let cart = getCart();
            const itemIndex = cart.findIndex(item => item.id === productId);

            if (itemIndex > -1) {
                if (cart[itemIndex].quantity !== newQuantity) {
                     cart[itemIndex].quantity = newQuantity;

                     const row = input.closest('.cart-item');
                     const subtotalElem = row.querySelector('.subtotal-price');

                     const price = parseFloat(cart[itemIndex].price);
                     const updatedItemSubtotal = !isNaN(price) ? price * newQuantity : 0;

                     if (subtotalElem) {
                          subtotalElem.textContent = `$${updatedItemSubtotal.toFixed(2)}`;
                     } else {
                         console.error("Elemento con clase 'subtotal-price' no encontrado en la fila del ítem del carrito con ID:", productId);
                     }

                     let overallSubtotal = cart.reduce((sum, item) => {
                         const itemPrice = parseFloat(item.price);
                         return sum + (!isNaN(itemPrice) ? itemPrice * item.quantity : 0);
                     }, 0);

                     if(cartSubtotalElem) cartSubtotalElem.textContent = `$${overallSubtotal.toFixed(2)}`;
                     if(cartTotalElem) cartTotalElem.textContent = `$${overallSubtotal.toFixed(2)}`;

                     clearTimeout(input.dataset.timeoutId);
                     const timeoutId = setTimeout(() => {
                         saveCart(cart);
                     }, 500);
                     input.dataset.timeoutId = timeoutId;

                     console.log(`Cantidad de producto ${productId} cambiada a ${newQuantity}. Subtotal: $${updatedItemSubtotal.toFixed(2)}. Total Carrito: $${overallSubtotal.toFixed(2)}.`);

                } else {
                     clearTimeout(input.dataset.timeoutId);
                     console.log(`Cantidad de producto ${productId} (value: ${newQuantity}) no cambió respecto al carrito (${cart[itemIndex].quantity}). No se guarda.`);
                }
            } else {
                 console.warn(`Producto con ID ${productId} no encontrado en el carrito al intentar cambiar cantidad.`);
            }
        }

        function handleRemoveItemOnCartPage(productId) {
             const itemToRemove = getCart().find(item => item.id === productId);

             if (itemToRemove && confirm(`¿Estás seguro de que deseas eliminar "${itemToRemove.name}" del carrito?`)) {
                 let cart = getCart();
                 cart = cart.filter(item => item.id !== productId);

                 saveCart(cart);
                 renderCartPage();
                 showNotification(`"${itemToRemove.name}" eliminado del carrito.`, 'info');
                 console.log(`Producto ${productId} eliminado. Carrito actualizado.`)
             }
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const cart = getCart();
                if (cart.length > 0) {
                    console.log("Procediendo a finalizar la compra con el carrito:", cart);
                    alert('Simulación: Procesando compra...');

                    saveCart([]);
                    renderCartPage();
                    showNotification('¡Compra simulada finalizada con éxito! Tu carrito ha sido vaciado.', 'success');

                } else {
                    showNotification('Tu carrito está vacío. No se puede proceder con la compra.', 'info');
                }
            });
        }

         renderCartPage();

    }

    updateCartIcon();

});
