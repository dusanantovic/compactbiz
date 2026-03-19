import { TranslationMessages } from "react-admin";
import serbianMessages from "./ra-language-serbian";

const customSerbianMessages: TranslationMessages = {
    ...serbianMessages,
    resources: {
        dashboard: {
            name: "Kontrolna tabla",
            pendingOrders: "Porudžbine na čekanju",
            inProgressOrders: "Porudžbine u toku",
            deliveryOrders: "U dostavi",
            completedOrders: "Završene porudžbine",
            canceledOrders: "Otkazane porudžbine",
            sellRevenue: "Ukupan prihod od prodaje",
            purchaseCost: "Ukupan trošak nabavke",
            totalProducts: "Ukupno proizvoda",
            lowStockProducts: "Upozorenja o zalihama",
            recentOrders: "Nedavne porudžbine",
            topProducts: "Najprodavaniji proizvodi",
            lowStock: "Proizvodi sa malo zaliha",
        },
        users: {
            name: "Korisnik |||| Korisnici",
        },
        orders: {
            name: "Porudžbina |||| Porudžbine",
            addNewProduct: "Dodaj novu porudžbinu",
            searchAside: "Pretraži po #ID ili partneru",
            type: "Tip",
            total: "Total",
            status: "Status",
            business: {
                name: "Partner"
            }
        },
        facilities: {
            name: "Radnja |||| Radnje",
            addNewFacility: "Dodaj novu radnju",
            searchAside: "Pretraži po imenu",
        },
        brands: {
            name: "Brend |||| Brendovi",
            searchAside: "Pretraži po imenu",
            addNewBrand: "Dodaj novi brend"
        },
        products: {
            name: "Proizvod |||| Proizvodi",
            addNewProduct: "Dodaj novi proizvod",
            searchAside: "Pretraži po imenu"
        },
        inventory: {
            name: "Inventar"
        },
        mycompany: {
            name: "Moja kompanija"
        },
        admin: {
            name: "Adminstracija"
        },
        adminstaff: {
            name: "Korisnik |||| Korisnici",
            searchAside: "Pretraži po email-u, imenu ili prezimenu",
            addNewUser: "Dodaj novog korisnika",
        },
        companies: {
            name: "Kompanije",
            addNewCompany: "Dodaj novu kompaniju",
            searchAside: "Pretraži po imenu"     
        },
        staff: {
            name: "Zaposlen |||| Zaposleni",
            searchAside: "Pretraži po email-u, telefonu, imenu ili prezimenu",
            addNewStaffMember: "Dodaj novog zaposlenog"
        },
        businesses: {
            name: "Firma |||| Firme",
            searchAside: "Pretraži po imenu",
            addNewBusiness: "Dodaj novu firmu"
        },
        misc: {
            business: "Biznis |||| Biznisi",
            partner: "Partner |||| Partneri",
            email: "Email",
            status: "Status",
            brand: "Brend |||| Brendovi",
            phone: "Telefon |||| Telefoni",
            verified: "Verifikovan |||| Verifikovani",
            name: "Ime |||| Imena",
            firstName: "Ime",
            lastName: "Prezime",
            filters: "Filter |||| Filteri",
            search: "Pretraga |||| Pretrage",
            password: "Šifra",
            data: "Podaci",
            role: "Uloga",
            type: "Tip",
            price: "Cena",
            lastPrice: "Poslednja korišćena cena",
            purchase: "Kupovina",
            sell: "Prodaja",
            both: "Oba",
            warehouseman: "Magacioner",
            driver: "Vozač",
            cashier: "Kasir",
            sales: "Prodaja",
            inventoryManager:"Menadžer magacina",
            manager: "Menadžer",
            owner: "Vlasnik",
            quantity: "Količina |||| Količine",
            product: "Proizvod |||| Proizvodi",
            item: "Stavka |||| Stavke",
            detail: "Detalj |||| Detalji",
            notes: "Beleška |||| Beleške",
            active:"Aktivna |||| Aktivne",
            paused:"Pauzirana |||| Pauzirane",
            inactive:"Neaktivana |||| Neaktivne",
            history: "Istorija",
            facility: "Radnja |||| Radnje",
            company: "Kompanija |||| Kompanije",
            address: "Adresa",
            country: "Država",
            city: "Grad",
            street: "Ulica",
            streetNumber: "Broj",
            zip: "Poštanski broj",
            submit: "Pošalji",
            orderSubmitted: "Porudžbina poslata",
            readyToPack: "Spremno za pakovanje",
            orderStarted: "Porudžbina je u toku",
            readyForDelivery: "Spremno za dostavu",
            orderDelivery: "Porudžbina je u dostavi",
            complete: "Završi",
            orderCompleted: "Porudžbina završena",
        }

    }
};

export default customSerbianMessages;