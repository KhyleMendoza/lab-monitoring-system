import supabase from "../supabase";

export async function getLaboratories() {
  const { data, error } = await supabase.from("laboratories").select("*");

  if (error) throw new Error("Unable to retrieve laboratories information.");

  return data;
}

export async function createNewLaboratory(newLaboratory) {
  const { data: laboratory } = await supabase
    .from("laboratories")
    .select()
    .eq("laboratoryName", newLaboratory.laboratoryName);

  if (laboratory.length) {
    throw new Error("Laboratory already exist!");
  }

  const { data, error } = await supabase
    .from("laboratories")
    .insert([newLaboratory])
    .select();

  if (error) {
    console.error(error.message);
    throw new Error("Unable to create new computer, please try again later.");
  }

  console.log(data.at(0));

  const newComputers = [];
  for (let count = 0; count < newLaboratory.totalComputers; count++) {
    newComputers.push({
      computer: `00${count}`,
      location: data.at(0)?.laboratoryId,
      computerStatus: "available",
      computerDamage: "",
    });
  }

  const { error: computerError } = await supabase
    .from("computers")
    .insert(newComputers);

  if (computerError) {
    console.error(computerError.message);
    await supabase
      .from("laboratories")
      .delete()
      .eq("location", data.at(0).laboratoryId);
  }
}
