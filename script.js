/* =========================================================
   CEO COIN GAME ENGINE
   Three.js 2D
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let player = null;

let scene;
let camera;
let renderer;

let officeGroup;

let clock;

let animationId;

let lastFrameTime = 0;

let lastAutoSave = 0;

let passiveAccumulator = 0;

let totalSessionSeconds = 0;


/* =========================================================
   UPGRADE CONFIG
========================================================= */

const UPGRADES = {

    mining: {
        name: "⛏️ Mining",
        description: "+1 base income setiap level.",
        baseCost: 100,
        multiplier: 1.45
    },

    marketing: {
        name: "📣 Marketing",
        description: "Meningkatkan pendapatan bisnis.",
        baseCost: 150,
        multiplier: 1.5
    },

    office: {
        name: "🏢 Office",
        description: "Meningkatkan kapasitas perusahaan.",
        baseCost: 250,
        multiplier: 1.55
    },

    employee: {
        name: "👨‍💼 Employee",
        description: "Meningkatkan passive income.",
        baseCost: 350,
        multiplier: 1.6
    },

    technology: {
        name: "💻 Technology",
        description: "Meningkatkan semua income.",
        baseCost: 500,
        multiplier: 1.7
    }

};


/* =========================================================
   BUSINESS CONFIG
========================================================= */

const BUSINESSES = {

    coffee_shop: {

        name: "☕ Coffee Shop",

        description:
            "Bisnis kecil untuk memulai empire.",

        unlockLevel: 1,

        baseCost: 500,

        income: 2
    },

    online_store: {

        name: "🛒 Online Store",

        description:
            "Toko online dengan income lebih tinggi.",

        unlockLevel: 2,

        baseCost: 1500,

        income: 8
    },

    tech_company: {

        name: "💻 Tech Company",

        description:
            "Perusahaan teknologi masa depan.",

        unlockLevel: 5,

        baseCost: 5000,

        income: 30
    },

    real_estate: {

        name: "🏙️ Real Estate",

        description:
            "Investasi properti untuk income besar.",

        unlockLevel: 10,

        baseCost: 20000,

        income: 120
    },

    investment: {

        name: "📈 Investment",

        description:
            "Investasi tingkat CEO.",

        unlockLevel: 20,

        baseCost: 100000,

        income: 700
    }

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initApp
);


async function initApp() {

    setupLoading();

    setupAuth();

    setupNavigation();

    setupPanelCloseButtons();

    setupLeaderboard();

    setupLogout();

    const saved =
        loadLocalPlayer();

    if (saved) {

        // Local save tetap tersedia.
        // User belum otomatis masuk jika akun server.
        console.log(
            "Local save ditemukan."
        );
    }
}


/* =========================================================
   LOADING
========================================================= */

function setupLoading() {

    const progress =
        document.getElementById(
            "loadingProgress"
        );

    let value = 0;

    const timer =
        setInterval(() => {

            value += 10;

            progress.style.width =
                value + "%";

            if (value >= 100) {

                clearInterval(timer);

                setTimeout(() => {

                    showPage("loginPage");

                }, 250);
            }

        }, 40);
}


/* =========================================================
   PAGE
========================================================= */

function showPage(id) {

    document
        .querySelectorAll(".screen")
        .forEach(el => {

            el.classList.add("hidden");
            el.classList.remove("active");

        });


    const page =
        document.getElementById(id);

    if (page) {

        page.classList.remove("hidden");
        page.classList.add("active");

    }
}


/* =========================================================
   AUTH
========================================================= */

function setupAuth() {

    document
        .getElementById("showRegisterBtn")
        .onclick = () => {

            showPage("registerPage");

        };


    document
        .getElementById("showLoginBtn")
        .onclick = () => {

            showPage("loginPage");

        };


    document
        .getElementById("loginBtn")
        .onclick = handleLogin;


    document
        .getElementById("registerBtn")
        .onclick = handleRegister;


    document
        .getElementById("guestBtn")
        .onclick = startGuest;
}


/* =========================================================
   REGISTER
========================================================= */

async function handleRegister() {

    const username =
        document
            .getElementById(
                "registerUsername"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "registerPassword"
            )
            .value;

    const confirmPassword =
        document
            .getElementById(
                "registerConfirmPassword"
            )
            .value;


    const message =
        document.getElementById(
            "registerMessage"
        );


    if (
        username.length < 3
    ) {

        showMessage(
            message,
            "Username minimal 3 karakter."
        );

        return;
    }


    if (
        password.length < 6
    ) {

        showMessage(
            message,
            "Password minimal 6 karakter."
        );

        return;
    }


    if (
        password !== confirmPassword
    ) {

        showMessage(
            message,
            "Konfirmasi password tidak sama."
        );

        return;
    }


    message.textContent =
        "Membuat akun...";


    try {

        const result =
            await registerUser(
                username,
                password
            );


        if (!result.success) {

            showMessage(
                message,
                result.message ||
                "Register gagal."
            );

            return;
        }


        showMessage(
            message,
            "Akun berhasil dibuat!"
        );


        setTimeout(() => {

            showPage("loginPage");

            document
                .getElementById(
                    "loginUsername"
                )
                .value = username;

        }, 800);


    } catch (error) {

        console.error(error);

        showMessage(
            message,
            "Tidak dapat terhubung ke server."
        );
    }
}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin() {

    const username =
        document
            .getElementById(
                "loginUsername"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "loginPassword"
            )
            .value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    if (!username || !password) {

        showMessage(
            message,
            "Username dan password harus diisi."
        );

        return;
    }


    showMessage(
        message,
        "Login..."
    );


    try {

        const result =
            await loginUser(
                username,
                password
            );


        if (!result.success) {

            showMessage(
                message,
                result.message ||
                "Login gagal."
            );

            return;
        }


        player =
            normalizePlayer(
                result.player
            );


        player.is_guest = false;


        saveLocalPlayer(player);


        showMessage(
            message,
            "Login berhasil!"
        );


        setTimeout(() => {

            startGame();

        }, 400);


    } catch (error) {

        console.error(error);

        showMessage(
            message,
            "Server tidak dapat diakses."
        );
    }
}


/* =========================================================
   GUEST
========================================================= */

function startGuest() {

    const oldSave =
        loadLocalPlayer();


    if (
        oldSave &&
        oldSave.is_guest
    ) {

        player =
            normalizePlayer(oldSave);

    } else {

        player =
            createDefaultPlayer(
                "Guest"
            );
    }


    player.is_guest = true;

    saveLocalPlayer(player);

    startGame();
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    showPage("gamePage");

    document
        .getElementById(
            "gamePage"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "playerName"
        )
        .textContent =
        player.username;


    initThree();

    updateAllUI();

    renderUpgradeList();

    renderBusinessList();

    updateProfile();


    setSaveStatus(
        player.is_guest
            ? "Offline"
            : "Saved"
    );


    if (animationId) {

        cancelAnimationFrame(
            animationId
        );
    }


    clock =
        new THREE.Clock();

    lastFrameTime =
        performance.now();

    lastAutoSave =
        performance.now();

    totalSessionSeconds = 0;


    animate();
}


/* =========================================================
   NORMALIZE
========================================================= */

function normalizePlayer(data) {

    const base =
        createDefaultPlayer(
            data.username || "Guest"
        );


    return {
        ...base,
        ...data,

        coin:
            Number(data.coin ?? base.coin),

        level:
            Number(data.level ?? base.level),

        exp:
            Number(data.exp ?? base.exp),

        total_coin:
            Number(
                data.total_coin ??
                base.total_coin
            ),

        total_income:
            Number(
                data.total_income ??
                base.total_income
            ),

        play_time:
            Number(
                data.play_time ??
                base.play_time
            )
    };
}


/* =========================================================
   THREE.JS
========================================================= */

function initThree() {

    const canvas =
        document.getElementById(
            "gameCanvas"
        );


    if (
        renderer &&
        canvas === renderer.domElement
    ) {

        resizeRenderer();

        return;
    }


    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x101729
        );


    camera =
        new THREE.OrthographicCamera(
            -10,
            10,
            6,
            -6,
            0.1,
            100
        );


    camera.position.z =
        10;


    renderer =
        new THREE.WebGLRenderer({

            canvas: canvas,

            antialias: true,

            alpha: false,

            powerPreference:
                "high-performance"

        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );


    createOffice();


    canvas.addEventListener(
        "pointerdown",
        handleGameTap
    );


    window.addEventListener(
        "resize",
        resizeRenderer
    );


    resizeRenderer();
}


/* =========================================================
   OFFICE
========================================================= */

function createOffice() {

    officeGroup =
        new THREE.Group();


    scene.add(
        officeGroup
    );


    // Floor

    const floor =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                20,
                12
            ),

            new THREE.MeshBasicMaterial({
                color: 0x17223b
            })

        );


    floor.position.z =
        -1;

    officeGroup.add(floor);


    // Wall

    const wall =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                20,
                5
            ),

            new THREE.MeshBasicMaterial({
                color: 0x1e2b49
            })

        );


    wall.position.y =
        3.5;

    wall.position.z =
        -0.8;

    officeGroup.add(wall);


    // Window

    for (
        let x = -5;
        x <= 5;
        x += 2.5
    ) {

        const windowMesh =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    1.8,
                    2
                ),

                new THREE.MeshBasicMaterial({
                    color: 0x273d64
                })

            );


        windowMesh.position.set(
            x,
            3.4,
            -0.6
        );


        officeGroup.add(
            windowMesh
        );
    }


    // Desk

    const desk =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                7,
                0.5,
                0.3
            ),

            new THREE.MeshBasicMaterial({
                color: 0x5a3b28
            })

        );


    desk.position.set(
        0,
        -1.8,
        0
    );


    officeGroup.add(desk);


    // Monitor

    const monitor =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.2,
                1.3,
                0.25
            ),

            new THREE.MeshBasicMaterial({
                color: 0x0b1020
            })

        );


    monitor.position.set(
        0,
        -0.65,
        0
    );


    officeGroup.add(
        monitor
    );


    // Screen

    const screen =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                1.8,
                0.9
            ),

            new THREE.MeshBasicMaterial({
                color: 0x705bff
            })

        );


    screen.position.set(
        0,
        -0.65,
        0.2
    );


    officeGroup.add(screen);


    // CEO character

    createCEO();


    // Coin objects

    createCoinObjects();
}


/* =========================================================
   CEO CHARACTER
========================================================= */

function createCEO() {

    const body =
        new THREE.Mesh(

            new THREE.CircleGeometry(
                0.75,
                32
            ),

            new THREE.MeshBasicMaterial({
                color: 0x7c5cff
            })

        );


    body.position.set(
        0,
        -0.1,
        0.5
    );


    officeGroup.add(
        body
    );


    const head =
        new THREE.Mesh(

            new THREE.CircleGeometry(
                0.38,
                24
            ),

            new THREE.MeshBasicMaterial({
                color: 0xffd1a4
            })

        );


    head.position.set(
        0,
        0.55,
        0.6
    );


    officeGroup.add(
        head
    );


    const eye1 =
        createSmallCircle(
            0.05,
            0xffffff
        );

    const eye2 =
        createSmallCircle(
            0.05,
            0xffffff
        );


    eye1.position.set(
        -0.12,
        0.57,
        0.7
    );


    eye2.position.set(
        0.12,
        0.57,
        0.7
    );


    officeGroup.add(
        eye1,
        eye2
    );
}


function createSmallCircle(
    radius,
    color
) {

    return new THREE.Mesh(

        new THREE.CircleGeometry(
            radius,
            16
        ),

        new THREE.MeshBasicMaterial({
            color: color
        })

    );
}


/* =========================================================
   COINS
========================================================= */

let coinMeshes = [];


function createCoinObjects() {

    coinMeshes = [];


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const coin =
            new THREE.Mesh(

                new THREE.CircleGeometry(
                    0.22,
                    20
                ),

                new THREE.MeshBasicMaterial({
                    color: 0xffd166
                })

            );


        const angle =
            (i / 7) *
            Math.PI *
            2;


        coin.position.set(

            Math.cos(angle) * 4,

            Math.sin(angle) * 1.5,

            0.2

        );


        officeGroup.add(
            coin
        );


        coinMeshes.push(
            coin
        );
    }
}


/* =========================================================
   RESIZE
========================================================= */

function resizeRenderer() {

    if (!renderer) {
        return;
    }


    const wrapper =
        document.querySelector(
            ".game-wrapper"
        );


    if (!wrapper) {
        return;
    }


    const width =
        wrapper.clientWidth;

    const height =
        wrapper.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    ) {

        return;
    }


    renderer.setSize(
        width,
        height,
        false
    );


    const aspect =
        width / height;


    const viewHeight =
        12;

    const viewWidth =
        viewHeight * aspect;


    camera.left =
        -viewWidth / 2;

    camera.right =
        viewWidth / 2;

    camera.top =
        viewHeight / 2;

    camera.bottom =
        -viewHeight / 2;


    camera.updateProjectionMatrix();
}


/* =========================================================
   ANIMATION
========================================================= */

function animate(time = 0) {

    animationId =
        requestAnimationFrame(
            animate
        );


    if (!renderer) {
        return;
    }


    const delta =
        Math.min(
            (time - lastFrameTime) /
            1000,
            0.1
        );


    lastFrameTime =
        time;


    totalSessionSeconds +=
        delta;


    passiveAccumulator +=
        delta;


    if (
        passiveAccumulator >= 1
    ) {

        const seconds =
            Math.floor(
                passiveAccumulator
            );

        passiveAccumulator -=
            seconds;


        const income =
            getIncomePerSecond();


        if (income > 0) {

            const amount =
                income * seconds;


            addCoins(
                amount,
                false
            );
        }
    }


    // coin animation

    coinMeshes.forEach(
        (coin, index) => {

            coin.rotation.z +=
                delta * 1.5;

            coin.position.y +=
                Math.sin(
                    time * 0.002 +
                    index
                ) * 0.0005;

        }
    );


    renderer.render(
        scene,
        camera
    );


    // Auto save

    if (
        time - lastAutoSave >
        15000
    ) {

        autoSave();

        lastAutoSave =
            time;
    }
}


/* =========================================================
   CLICK / TAP
========================================================= */

function handleGameTap(event) {

    const rect =
        renderer.domElement
            .getBoundingClientRect();


    const x =
        event.clientX -
        rect.left;


    const y =
        event.clientY -
        rect.top;


    const normalizedX =
        (x / rect.width) * 2 - 1;


    const normalizedY =
        -(y / rect.height) * 2 + 1;


    const worldX =
        normalizedX *
        (camera.right);


    const worldY =
        normalizedY *
        (camera.top);


    /*
        Area pusat kantor dianggap
        sebagai area penghasil coin.
    */

    if (
        worldX > -4 &&
        worldX < 4 &&
        worldY > -2.5 &&
        worldY < 2.5
    ) {

        const amount =
            getClickIncome();


        addCoins(
            amount,
            true
        );


        createCoinParticles(
            worldX,
            worldY
        );
    }
}


/* =========================================================
   CLICK INCOME
========================================================= */

function getClickIncome() {

    const mining =
        player.mining_level || 1;

    const marketing =
        player.marketing_level || 1;

    const technology =
        player.technology_level || 1;


    let amount =
        1 +
        mining;


    amount *=
        1 +
        (marketing - 1) *
        0.05;


    amount *=
        1 +
        (technology - 1) *
        0.08;


    return Math.max(
        1,
        Math.floor(amount)
    );
}


/* =========================================================
   PASSIVE INCOME
========================================================= */

function getIncomePerSecond() {

    let income =
        player.mining_level || 1;


    Object.entries(
        BUSINESSES
    ).forEach(
        ([key, business]) => {

            const count =
                Number(
                    player[key] || 0
                );


            income +=
                count *
                business.income;
        }
    );


    const marketing =
        player.marketing_level || 1;

    const employee =
        player.employee_level || 1;

    const technology =
        player.technology_level || 1;


    income *=
        1 +
        (marketing - 1) *
        0.08;


    income *=
        1 +
        (employee - 1) *
        0.12;


    income *=
        1 +
        (technology - 1) *
        0.1;


    return Math.max(
        0,
        Math.floor(income)
    );
}


/* =========================================================
   ADD COINS
========================================================= */

function addCoins(
    amount,
    showEffect = true
) {

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return;
    }


    amount =
        Math.floor(amount);


    player.coin +=
        amount;


    player.total_coin +=
        amount;


    player.total_income +=
        amount;


    addEXP(
        Math.max(
            1,
            Math.floor(
                amount / 10
            )
        )
    );


    if (showEffect) {

        showFloatingCoin(
            amount
        );
    }


    updateAllUI();

    saveLocalPlayer(
        player
    );
}


/* =========================================================
   EXP
========================================================= */

function getExpRequired() {

    return Math.floor(
        100 *
        Math.pow(
            1.25,
            player.level - 1
        )
    );
}


function addEXP(amount) {

    player.exp +=
        amount;


    while (
        player.exp >=
        getExpRequired()
    ) {

        player.exp -=
            getExpRequired();


        player.level++;


        showToast(
            "🎉 LEVEL UP! Kamu sekarang level " +
            player.level
        );
    }
}


/* =========================================================
   FLOATING COIN
========================================================= */

function showFloatingCoin(
    amount
) {

    const element =
        document.getElementById(
            "floatingMessage"
        );


    element.textContent =
        "+" +
        formatNumber(amount) +
        " COIN";


    element.classList.remove(
        "show"
    );


    void element.offsetWidth;


    element.classList.add(
        "show"
    );
}


/* =========================================================
   PARTICLES
========================================================= */

function createCoinParticles(
    x,
    y
) {

    /*
        Efek visual ringan.
        Tidak membuat particle system
        berat.
    */

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const coin =
            new THREE.Mesh(

                new THREE.CircleGeometry(
                    0.08,
                    12
                ),

                new THREE.MeshBasicMaterial({
                    color: 0xffd166
                })

            );


        coin.position.set(
            x,
            y,
            1
        );


        scene.add(
            coin
        );


        const angle =
            Math.random() *
            Math.PI *
            2;


        const speed =
            1 +
            Math.random() *
            2;


        const vx =
            Math.cos(angle) *
            speed;


        const vy =
            Math.sin(angle) *
            speed;


        const start =
            performance.now();


        function particleAnimation(
            now
        ) {

            const elapsed =
                (now - start) /
                1000;


            coin.position.x +=
                vx * 0.016;


            coin.position.y +=
                vy * 0.016;


            coin.scale.setScalar(
                Math.max(
                    0,
                    1 - elapsed
                )
            );


            if (
                elapsed < 1
            ) {

                requestAnimationFrame(
                    particleAnimation
                );

            } else {

                scene.remove(
                    coin
                );

                coin.geometry.dispose();

                coin.material.dispose();
            }
        }


        requestAnimationFrame(
            particleAnimation
        );
    }
}


/* =========================================================
   UPGRADE COST
========================================================= */

function getUpgradeCost(
    key
) {

    const config =
        UPGRADES[key];


    const level =
        Number(
            player[
                key + "_level"
            ] || 1
        );


    return Math.floor(
        config.baseCost *
        Math.pow(
            config.multiplier,
            level - 1
        )
    );
}


/* =========================================================
   BUY UPGRADE
========================================================= */

function buyUpgrade(
    key
) {

    const cost =
        getUpgradeCost(key);


    if (
        player.coin < cost
    ) {

        showToast(
            "❌ Coin tidak cukup."
        );

        return;
    }


    player.coin -=
        cost;


    player[
        key + "_level"
    ]++;


    addEXP(
        10
    );


    showToast(
        "⚡ " +
        UPGRADES[key].name +
        " berhasil di-upgrade!"
    );


    saveLocalPlayer(
        player
    );


    renderUpgradeList();

    updateAllUI();

    autoSave();
}


/* =========================================================
   BUSINESS COST
========================================================= */

function getBusinessCost(
    key
) {

    const business =
        BUSINESSES[key];


    const count =
        Number(
            player[key] || 0
        );


    return Math.floor(
        business.baseCost *
        Math.pow(
            1.25,
            count
        )
    );
}


/* =========================================================
   BUY BUSINESS
========================================================= */

function buyBusiness(
    key
) {

    const business =
        BUSINESSES[key];


    if (
        player.level <
        business.unlockLevel
    ) {

        showToast(
            "🔒 Unlock di level " +
            business.unlockLevel
        );

        return;
    }


    const cost =
        getBusinessCost(key);


    if (
        player.coin < cost
    ) {

        showToast(
            "❌ Coin tidak cukup."
        );

        return;
    }


    player.coin -=
        cost;


    player[key] =
        Number(
            player[key] || 0
        ) + 1;


    addEXP(
        20
    );


    showToast(
        "💼 " +
        business.name +
        " berhasil dibeli!"
    );


    saveLocalPlayer(
        player
    );


    renderBusinessList();

    updateAllUI();

    autoSave();
}


/* =========================================================
   RENDER UPGRADES
========================================================= */

function renderUpgradeList() {

    const container =
        document.getElementById(
            "upgradeList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    Object.entries(
        UPGRADES
    ).forEach(
        ([key, config]) => {

            const level =
                Number(
                    player[
                        key + "_level"
                    ] || 1
                );


            const cost =
                getUpgradeCost(key);


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "item-card";


            card.innerHTML = `

                <div class="item-top">

                    <div class="item-name">
                        ${config.name}
                    </div>

                    <div>
                        Lv. ${level}
                    </div>

                </div>

                <div class="item-description">
                    ${config.description}
                </div>

                <div class="item-bottom">

                    <div class="item-price">
                        🪙 ${formatNumber(cost)}
                    </div>

                    <button
                        class="item-button"
                        data-upgrade="${key}"
                        ${player.coin < cost ? "disabled" : ""}
                    >
                        UPGRADE
                    </button>

                </div>
            `;


            container.appendChild(
                card
            );
        }
    );


    container
        .querySelectorAll(
            "[data-upgrade]"
        )
        .forEach(button => {

            button.onclick =
                () => {

                    buyUpgrade(
                        button.dataset.upgrade
                    );

                };

        });
}


/* =========================================================
   RENDER BUSINESS
========================================================= */

function renderBusinessList() {

    const container =
        document.getElementById(
            "businessList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    Object.entries(
        BUSINESSES
    ).forEach(
        ([key, business]) => {

            const count =
                Number(
                    player[key] || 0
                );


            const cost =
                getBusinessCost(key);


            const locked =
                player.level <
                business.unlockLevel;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "item-card";


            card.innerHTML = `

                <div class="item-top">

                    <div class="item-name">
                        ${business.name}
                    </div>

                    <div>
                        x${count}
                    </div>

                </div>

                <div class="item-description">
                    ${business.description}
                    <br>
                    +${business.income} income/s
                </div>

                <div class="item-bottom">

                    <div class="item-price">

                        ${
                            locked
                            ? "🔒 Lv. " +
                              business.unlockLevel
                            : "🪙 " +
                              formatNumber(cost)
                        }

                    </div>

                    <button
                        class="item-button"
                        data-business="${key}"
                        ${
                            locked ||
                            player.coin < cost
                                ? "disabled"
                                : ""
                        }
                    >
                        ${
                            locked
                            ? "LOCKED"
                            : "BUY"
                        }
                    </button>

                </div>
            `;


            container.appendChild(
                card
            );
        }
    );


    container
        .querySelectorAll(
            "[data-business]"
        )
        .forEach(button => {

            button.onclick =
                () => {

                    buyBusiness(
                        button.dataset.business
                    );

                };

        });
}


/* =========================================================
   UI
========================================================= */

function updateAllUI() {

    if (!player) {
        return;
    }


    document
        .getElementById(
            "coinDisplay"
        )
        .textContent =
        formatNumber(
            Math.floor(player.coin)
        );


    document
        .getElementById(
            "levelDisplay"
        )
        .textContent =
        player.level;


    document
        .getElementById(
            "incomeDisplay"
        )
        .textContent =
        formatNumber(
            getIncomePerSecond()
        ) +
        "/s";


    document
        .getElementById(
            "expDisplay"
        )
        .textContent =
        formatNumber(player.exp) +
        "/" +
        formatNumber(
            getExpRequired()
        );


    updateProfile();
}


/* =========================================================
   PROFILE
========================================================= */

function updateProfile() {

    if (!player) {
        return;
    }


    document
        .getElementById(
            "profileUsername"
        )
        .textContent =
        player.username;


    document
        .getElementById(
            "profileId"
        )
        .textContent =
        player.player_id;


    document
        .getElementById(
            "profileLevel"
        )
        .textContent =
        player.level;


    document
        .getElementById(
            "profileCoin"
        )
        .textContent =
        formatNumber(
            Math.floor(
                player.total_coin
            )
        );


    document
        .getElementById(
            "profileIncome"
        )
        .textContent =
        formatNumber(
            Math.floor(
                player.total_income
            )
        );


    const minutes =
        Math.floor(
            (
                Number(
                    player.play_time || 0
                ) +
                totalSessionSeconds
            ) / 60
        );


    document
        .getElementById(
            "profilePlayTime"
        )
        .textContent =
        minutes +
        " menit";
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const panelId =
                        button.dataset.panel;


                    document
                        .querySelectorAll(
                            ".nav-btn"
                        )
                        .forEach(
                            btn =>
                                btn.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList.add(
                        "active"
                    );


                    if (
                        panelId ===
                        "gamePanel"
                    ) {

                        closeAllPanels();

                        return;
                    }


                    openPanel(
                        panelId
                    );
                }
            );
        });
}


/* =========================================================
   PANELS
========================================================= */

function openPanel(
    id
) {

    closeAllPanels();


    const panel =
        document.getElementById(
            id
        );


    if (panel) {

        panel.classList.remove(
            "hidden"
        );
    }


    if (
        id ===
        "upgradePanel"
    ) {

        renderUpgradeList();
    }


    if (
        id ===
        "businessPanel"
    ) {

        renderBusinessList();
    }


    if (
        id ===
        "leaderboardPanel"
    ) {

        loadLeaderboard();
    }
}


function closeAllPanels() {

    document
        .querySelectorAll(
            ".overlay-panel"
        )
        .forEach(panel => {

            panel.classList.add(
                "hidden"
            );
        });
}


function setupPanelCloseButtons() {

    document
        .querySelectorAll(
            ".close-panel"
        )
        .forEach(button => {

            button.onclick =
                closeAllPanels;

        });
}


/* =========================================================
   LEADERBOARD
========================================================= */

function setupLeaderboard() {

    document
        .getElementById(
            "refreshLeaderboard"
        )
        .onclick =
        loadLeaderboard;
}


async function loadLeaderboard() {

    const container =
        document.getElementById(
            "leaderboardList"
        );


    container.innerHTML =
        "Loading...";


    if (
        !API_URL ||
        API_URL.includes(
            "YOUR_GOOGLE"
        )
    ) {

        container.innerHTML =
            `
            <div class="item-card">
                Leaderboard membutuhkan
                Google Apps Script.
            </div>
            `;

        return;
    }


    try {

        const result =
            await getLeaderboard();


        if (
            !result.success
        ) {

            throw new Error(
                result.message
            );
        }


        container.innerHTML =
            "";


        result.players.forEach(
            (p, index) => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "rank-row";


                row.innerHTML = `

                    <div class="rank-number">
                        #${index + 1}
                    </div>

                    <div class="rank-user">
                        ${escapeHTML(
                            p.username
                        )}
                    </div>

                    <div class="rank-coin">
                        🪙 ${formatNumber(
                            p.coin
                        )}
                    </div>
                `;


                container.appendChild(
                    row
                );
            }
        );


        if (
            result.players.length === 0
        ) {

            container.innerHTML =
                "Belum ada pemain.";

        }


    } catch (error) {

        console.error(error);

        container.innerHTML =
            `
            <div class="item-card">
                Gagal mengambil leaderboard.
            </div>
            `;
    }
}


/* =========================================================
   SAVE
========================================================= */

async function autoSave() {

    if (!player) {
        return;
    }


    player.play_time =
        Number(
            player.play_time || 0
        ) +
        Math.floor(
            totalSessionSeconds
        );


    totalSessionSeconds = 0;


    saveLocalPlayer(
        player
    );


    if (
        player.is_guest
    ) {

        setSaveStatus(
            "Offline"
        );

        return;
    }


    setSaveStatus(
        "Saving..."
    );


    try {

        const result =
            await savePlayerToServer(
                player
            );


        if (
            result.success
        ) {

            setSaveStatus(
                "Saved ✓"
            );

        } else {

            setSaveStatus(
                "Save failed"
            );
        }


    } catch (error) {

        console.error(error);

        setSaveStatus(
            "Offline"
        );
    }
}


/* =========================================================
   SAVE STATUS
========================================================= */

function setSaveStatus(
    text
) {

    const element =
        document.getElementById(
            "saveStatus"
        );


    if (element) {

        element.textContent =
            text;
    }
}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    document
        .getElementById(
            "logoutBtn"
        )
        .onclick =
        async () => {

            await autoSave();


            if (animationId) {

                cancelAnimationFrame(
                    animationId
                );

                animationId =
                    null;
            }


            player = null;


            closeAllPanels();

            showPage(
                "loginPage"
            );
        };
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    element,
    message
) {

    element.textContent =
        message;
}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
    number
) {

    number =
        Number(number) || 0;


    if (
        number >= 1000000000
    ) {

        return (
            number / 1000000000
        ).toFixed(2) + "B";

    }


    if (
        number >= 1000000
    ) {

        return (
            number / 1000000
        ).toFixed(2) + "M";

    }


    if (
        number >= 1000
    ) {

        return (
            number / 1000
        ).toFixed(2) + "K";
    }


    return Math.floor(
        number
    ).toLocaleString(
        "id-ID"
    );
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   BEFORE UNLOAD
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (player) {

            saveLocalPlayer(
                player
            );
        }
    }
);
