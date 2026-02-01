import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";
import { menuItems, stockItems, tables, users } from "@/lib/initial-data";
import { NextResponse } from "next/server";

export async function GET() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // Seed Menu Items
    const menuItemsCollection = collection(db, "menuItems");
    const menuItemsSnapshot = await getDocs(menuItemsCollection);
    if (menuItemsSnapshot.empty) {
      for (const item of menuItems) {
        await addDoc(menuItemsCollection, item);
      }
      console.log("Menu items seeded.");
    } else {
      console.log("Menu items already exist, skipping.");
    }

    // Seed Stock Items
    const stockItemsCollection = collection(db, "stockItems");
     const stockItemsSnapshot = await getDocs(stockItemsCollection);
    if (stockItemsSnapshot.empty) {
        for (const item of stockItems) {
            await addDoc(stockItemsCollection, item);
        }
        console.log("Stock items seeded.");
    } else {
        console.log("Stock items already exist, skipping.");
    }

    // Seed Tables
    const tablesCollection = collection(db, "tables");
    const tablesSnapshot = await getDocs(tablesCollection);
    if (tablesSnapshot.empty) {
        for (const item of tables) {
            await addDoc(tablesCollection, item);
        }
        console.log("Tables seeded.");
    } else {
        console.log("Tables already exist, skipping.");
    }

    // Seed/Update Users (always)
    for (const user of users) {
      await setDoc(doc(db, "users", user.uid), user);
    }
    console.log("Users seeded/updated.");
    
    return NextResponse.json({ success: true, message: 'Database seeding process completed. Users are now up-to-date.' });

  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json({ success: false, message: 'Error seeding database.', error: (error as Error).message }, { status: 500 });
  }
}
