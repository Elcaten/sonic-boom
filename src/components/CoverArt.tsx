import { subsonicQuery } from "@/queries/subsonic-query";
import { useSubsonicQuery } from "@/queries/use-subsonic-query";
import { Image } from "expo-image";
import { ImageStyle, StyleProp, StyleSheet, useColorScheme, View } from "react-native";

export function CoverArt({
  id,
  style,
  size,
  elevated = false,
}: {
  /** The ID of a song, album or artist. */
  id: string | undefined;
  style?: StyleProp<ImageStyle>;
  size: Parameters<(typeof subsonicQuery)["coverArtUrl"]>[1];
  elevated?: boolean;
}) {
  const theme = useColorScheme() ?? "light";
  const coverArtQuery = useSubsonicQuery(subsonicQuery.coverArtUrl(id, size));

  const borderRadius = {
    48: 6,
    256: 12,
  }[size];

  const themedShadowContainer =
    theme === "light"
      ? [styles.shadowContainer]
      : [styles.shadowContainer, styles.shadowContainerDark];
  const shadow = {
    48: themedShadowContainer,
    256: themedShadowContainer,
  }[size];

  const imgSize = size;

  return (
    <View style={[{ width: imgSize, height: imgSize }, elevated && shadow]}>
      <Image
        placeholder={{
          blurhash: getRandomBlurhash(),
        }}
        placeholderContentFit="fill"
        source={
          coverArtQuery.isLoading
            ? undefined
            : { uri: coverArtQuery?.data, cacheKey: `cover-${id}-${size}` }
        }
        style={[{ width: imgSize, height: imgSize, borderRadius }, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  shadowContainerDark: {
    shadowColor: "#282828",
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
});

const blurhashList = [
  "njG9jfn$M{ofRj_NoJWrt6Rjx]WWofs:RkWVR+RjoLofNGWBM{WBt7RkjsRjR*of",
  "n6Ack?OtoN^yt$}=Iw4r$|ELt5IVWYadS5x=?Et2-.t7NcM}nlI;$gNxR-ItM}-S",
  "ngJQ4,9[D5%Mx]9Gn$%gj@afM|%2o}IUR*j[WBbGt7V[aLoLW.ofj@-pkCIUWBt7",
  "nEPZ0{-q.SofIA_Ni_xuWUR+%NR5D%WBt7%3MdbcozjFIUt7V@tRRjogjGX8aeRP",
  "nXHom=M{x[Nu.8?]oft7%MxuNsX5xbbFIU%2M{rtRQRQo}Rjt7jFoyV@ozWBofWU",
  "nfQT4HIU~q%MWBt7WBM{ofxu?bt7IURjj[RjofxtRkRjfjofj[WBj[ayj[j[WBay",
  "n79?,o%10#bb=|9aafIoR*xaIoRkxas:IoELaz=|j@IpnOn%NwR*$*-oofI;ofs.",
  "nUJ?yjrX0gIqIp0,btxtE3M{S$obRks:S2xuIpoJs.s,slxaoJjFoeNHofR+aeWC",
  "n22i99j[4nWB_3j[fQayfQj[4nay_3of9FayfQj[fQay?bj[9FWB-;j[fQayfQj[",
  "nhJ8R[t7Rjofof~qofM{j[Rj%MofayfQWBIUofoffQofIUofj[ayofD%WBofoLof",
  "nMCPIvVsD,kVS5~BV@NLkBNHxGofxHs.J8R+WXxCsANaWBe:oeogjER*jsR*bIxE",
  "nNE3r2DiH?tlo#5ZVrH?tStR_NROnhtSoekrMxtQkDMxxujEbIa#V?WYadogj[WA",
  "nDJRHoRO~V4.%1%Ms.Rks:og~qE1E1%MR*D$jG%MM|oeV@Rjj]oejZRjRjofaykC",
  "nUGlCqof00xuxuNF%M?bj[-;?uoft7xtayt7WB-;t7R%IVay-;WBWBt7Rjt7a{Rj",
  "nwLg#9R*~XWVoc%NkCWAkCaeoJkCM{bHRjxvWVjZWVRiodfkM{j]t8ofbHf6ayoL",
  "nIGI4Widvfn4D$1iKjMvwa$y0.r@$es,M{Sj-9-nt8WB-;NZX8bws.RjIpNHIps+",
  "nEHKF1Na0NkV?ZAC-m%KM|s,T0xt=[oM9vInofx[aeM|K5RkNGjuso$eS4I[WC-U",
  "nK3{C*iuT1bwi_ueaiX9k8i^TKjEnzjYkDXCj?jEWCkDbvbba$a#j?jDWWf+ofbI",
  "nASs1[%M_NMxIUD%%MjsM{%MWXtRDiWB_NMxt7kCRjt79Fof-;RjIUxuWBWBofWB",
  "niM@cdRkoe%1xuNHRjocj@oe~qxaWBR*RjZ}j]ozRka#%MoeWBoffRxvaejsWXa}",
  "nOR{x*j[_4j[of~qfQ9FayWBWqa|f5j[j[8_fQ-;ayj[_3j[D%ayWB9Fay%Mj[of",
  "nBE3C*-;00WB?bRjRj?bxuayof%M%MM{IU-;fQof%M-;?bj[ofRj9Ft7WBWBoft7",
  "ndFiGWWEI;t7o#ysofkCjbW=PCo2s:WoNGX:WBn+R*t5TLayjZWBs:o#WCoeofWC",
  "nVD99ykC0#Vqw@IvohtLWBnin3V@o|g5WZ$eaeI[kCs,JCfkw[jEay${bHR-jENK",
  "nQG+dUe.NZbFjIEGn+RkfhX8q*e=Nas-jG9*a}S4Wqax]hbYoxa$WV#QX4s,WCjZ",
  "nZI#x_fQ-;ayxu-;fQj[WBWB~qt7Rjj[Rj?bRjofj[t7-;ofRjofj[RjofWBj[ay",
  "nWECd@~W~W-;~qs:n%%2RPRjkWWVIUoLxaW;ozWpkCWVofozR*WVWVWVbHbHofof",
  "nA7-pKM{s.WEoz?bM|xaRjWX4mNGt6ofM{00ofa#t7Rjoz%MRjWBt7_4%LM{Rj%L",
  "nEPrP~az-%k9x:8hpU$ja|$~4[U.tMaz%GvDl0tejIxq%;kkvokSnlw4Z:tejIXO",
  "n568~zIUJCS5xWpfoIadogj[9v%Nr;t7Ne%MMwWAX9kD%1M_bIoft7I[%2V@jakC",
  "nKI3n9TKZ~W?3E_2V?R*nhrWUGR*R,WVwI%~n%n$X8SOGajERjs9w^?Ho#ofX9bc",
  "nFIOOlzpM0w0IU+$^+-pRQD%.l4.Sgx]%M=}%2s:jZaypHX7%fIUIU-;M{IUt7%M",
  "nFEo_P00?bM{4n00Rjayaffk9F_39Ft7?vIU4nxu%May_3V[ayofRj_3RjxuIURj",
  "nGG8$M9sS5v}^$^H_2IYSi$_%LVXj0I=-jRiVsofs;n#0KxtS5nlWBx^WAbvt7WB",
  "nJLE7-$+D*?bRjNHRQ-;xaRk01oyWTRQV[?bxuj]kBxtD%Rjt7a}a}xu%MRjM{ay",
  "nTOgW+og~UadD+~URkIVxZt6M|ofM~WCt4xZoct6Rka#kCWCNGt7ofj=j[ofaeay",
  "nL9t.8s.R+RPae?]t5WqoyjZXmxue.ofV@NIa}oKofoytQM|WBafozoeR+RkWBR+",
  "nZHw_s.8M_t6ba~WxuM_t7oz%MaxR*tRogxuoekCt7RjxuoLj[bIRjt7s;ofRjV@",
  "nQIqDq?G]i8_-o~p%2D%IUs:t7xGIoW;soWXSgxus:S2D*WBs:t7RjyDV@-;Rjt7",
  "nTRVIP#PL}tQx^%NIAx]V@j=%~fiM|t7RkMct5aeRitlR.o~o|tRocn#V@V@ofae",
  "nJEVTixu0#w0-RETOFRjtQkWT0rqv}NINx#QjENHRkn+nhNHs,t5S4n$t6WCoeoc",
];

function getNormalRandomElement<T>(array: T[]) {
  if (array.length === 0) return undefined;
  if (array.length === 1) return array[0];

  // Box-Muller transform to generate normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  // Map z (mean=0, stddev=1) to array index
  // z is typically between -3 and 3, map to 0 to array.length-1
  const mean = (array.length - 1) / 2;
  const stddev = array.length / 6; // ~99.7% within array bounds

  let index = Math.round(mean + z * stddev);

  // Clamp to array bounds
  index = Math.max(0, Math.min(array.length - 1, index));

  return array[index];
}

function getRandomBlurhash() {
  return getNormalRandomElement(blurhashList);
}
