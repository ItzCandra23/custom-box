import { ItemStack } from "bdsx/bds/inventory";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { ServerPlayer } from "bdsx/bds/player";

export enum BoxType {
    Chest = "minecraft:chest",
    TrappedChest = "minecraft:trapped_chest",
    Hopper = "minecraft:hopper",
    Dropper = "minecraft:dropper",
    Dispenser = "minecraft:dispenser",
}

export enum BoxSize {
    Chest = 27,
    TrappedChest = 27,
    Hopper = 5,
    Dropper = 9,
    Dispenser = 9,
}

export type BoxSlots = Record<number, ItemStack>;

export class CustomBox {
    private box: {
        name?: string;
        lores?: string[];
        amount: number;
        glow: boolean;
        type: BoxType;
        items: BoxSlots;
    } = {
        name: undefined,
        lores: undefined,
        amount: 1,
        glow: false,
        type: BoxType.Chest,
        items: {},
    }

    constructor(type?: BoxType, name?: string, amount?: number) {
        if (!Object.keys(BoxType).includes(type ?? BoxType.Chest)) this.box.type=BoxType.Chest;
        this.box.type = type ?? BoxType.Chest;
        if (name) this.box.name = name;
        if (amount) {
            if (amount < 1) this.box.amount = 1;
            else this.box.amount = amount;
        }
    }

    /**Change box name. */
    setName(name: string): void {
        this.box.name = name;
    }

    /**Get box name. */
    getName(): string {
        return this.box.name ?? ItemStack.constructWith(this.box.type).getName();
    }

    /**Set box lores. */
    setLores(lores: string[]): void {
        this.box.lores = lores;
    }

    /**Get box lores. */
    getLores(): string[] {
        return this.box.lores ?? [];
    }

    /**Change box amount(min: 1). */
    setAmount(amount: number): void {
        if (amount < 1) this.box.amount = 1;
        this.box.amount = amount;
    }

    /**Get box amount. */
    getAmount(): number {
        return this.box.amount;
    }

    /**Set enchant effect in box. */
    setGlow(glow: boolean): void {
        this.box.glow=glow;
    }

    /**Check glow mode in box. */
    isGlow(): boolean {
        return this.box.glow;
    }

    /**Change box type. */
    setType(type: BoxType): boolean {
        if (!Object.keys(BoxType).includes(type)) return false;
        else {
            this.box.type;
            return true;
        }
    }

    /**Get box type. */
    getType(): BoxType {
        return this.box.type;
    }

    /**Get box size. */
    getSize(): BoxSize {
        const type = this.box.type;
        if (type === BoxType.Chest) return BoxSize.Chest;
        if (type === BoxType.TrappedChest) return BoxSize.TrappedChest;
        if (type === BoxType.Hopper) return BoxSize.Hopper;
        if (type === BoxType.Dropper) return BoxSize.Dropper;
        if (type === BoxType.Dispenser) return BoxSize.Dispenser;
        return BoxSize.Chest
    }

    /**Add item in box. */
    addItem(item: ItemStack): boolean {
        for(let i = 0; i < this.getSize(); i++) {
            if(!this.box.items[i]) {
                return this.setSlot(i, item, false);
            }
        }
        return false;
    }

    /**Set item in box. */
    setSlot(slot: number, item: ItemStack, replace: boolean = true): boolean {
        if (slot < 0||slot >= this.getSize()) return false;
        if (!replace) {
            if (this.box.items.hasOwnProperty(slot)) return false;
            else this.box.items[slot] = item;
        }
        this.box.items[slot] = item;
        return true;
    }

    /**Set all box slots. */
    setSlots(slots: BoxSlots, replace: boolean = true): void {
        for (const slot of Object.entries(slots)) {
            this.setSlot(Number(slot[0]), slot[1], replace);
        }
    }

    /**Get ItemStack. */
    getItemStack(): ItemStack {
        const box = this.box;
        const item = ItemStack.constructWith(box.type, box.amount);

        if (box.glow) {
            const itm = item.save();
            const ench = NBT.allocate({
                ...itm,
                tag: {
                    ...itm.tag,
                    ench: [{ id: NBT.short(-1), lvl: NBT.short(1) }],
                }
            }) as CompoundTag;
            item.load(ench);
            ench.dispose();
        }

        if (box.name) item.setCustomName(box.name);
        if (box.lores) item.setCustomLore(box.lores);

        let items: CompoundTag[] = [];
        for (const items_ of Object.entries(box.items)) {
            const slt = items_[0];
            const itm = items_[1].save();

            const nbt = NBT.allocate({
                ...itm,
                Slot: NBT.byte(+slt),
            }) as CompoundTag;

            items.push(nbt);
        }

        const tag = item.save();
        const nbt = NBT.allocate({
            ...tag,
            tag: {
                ...tag.tag,
                Items: items,
            }
        }) as CompoundTag;
        item.load(nbt);

        return item;
    }

    /**Give box to player. */
    sendTo(player: ServerPlayer): void {
        player.addItem(this.getItemStack());
        player.sendInventory();
        this.destruct();
    }

    destruct(): void {
        this.box = {
            name: undefined,
            lores: undefined,
            amount: 1,
            glow: false,
            type: BoxType.Chest,
            items: {},
        }
    }
}