# CustomBox for BDSX
```ts
import { CustomBox } from "@bdsx/custom-box";
import { command } from "bdsx/command";
import { ItemStack } from "bdsx/bds/inventory";
import { PlayerCommandSelector } from "bdsx/bds/command";
import { int32_t } from "bdsx/nativetype";

command.register("box", "Give special box to player.")
.overload((p, o) => {
    for (const player of p.target.newResults(o)) {
        if (player.isPlayer()) {

            const box = new CustomBox();
            box.setName("§l§6SpecialBox");
            box.setLores(["This is SpecialBox", "This Box for You :D"]);
            box.setGlow(true);

            const specialApple = ItemStack.constructWith("minecraft:enchanted_golden_apple", 64);
            specialApple.setCustomName("§aSpecial Apple");
            box.setSlots({
                0: ItemStack.constructWith("minecraft:apple"),
                4: specialApple,
                8: ItemStack.constructWith("minecraft:cake", 8),
            });

            box.sendTo(player);
            box.destruct();
        }
    }
}, {
    target: PlayerCommandSelector,
    amount: int32_t,
});
```
